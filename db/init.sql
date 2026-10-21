--
-- PostgreSQL database dump
--

\restrict 9QP4ax0sEqx9uwrWsLqV6SCQe9Oggn4yhy3B3hCyUaMs5p2tNKstoukd4Xg0wH0

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-10-20 22:42:24

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 25772)
-- Name: analytics; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA analytics;


--
-- TOC entry 241 (class 1255 OID 24726)
-- Name: getmark1(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.getmark1(integer) RETURNS integer
    LANGUAGE plpgsql
    AS $_$ 
DECLARE res INTEGER;
BEGIN
    IF $1 BETWEEN 55 AND 70 THEN SELECT 3 INTO res;
    ELSIF $1 BETWEEN 71 AND 85 THEN SELECT 4 INTO res;
    ELSIF $1 BETWEEN 86 AND 100 THEN SELECT 5 INTO res;
    ELSE SELECT 2 INTO res; 
    END IF; 
    RETURN res;
END;
$_$;


--
-- TOC entry 242 (class 1255 OID 24733)
-- Name: getmark2(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.getmark2(integer) RETURNS integer
    LANGUAGE plpgsql
    AS $_$ 
DECLARE kolvo INTEGER;
DECLARE mark INTEGER; 
BEGIN
    SELECT 2 INTO mark;
    SELECT COUNT(*) INTO kolvo FROM Marks WHERE $1 BETWEEN LowBalls AND HighBalls;
    IF kolvo > 0 THEN
        SELECT idMark INTO mark FROM Marks WHERE $1 BETWEEN LowBalls AND HighBalls;
    END IF;
    RETURN mark;
END;
$_$;


--
-- TOC entry 243 (class 1255 OID 24734)
-- Name: getmark3(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.getmark3(integer) RETURNS integer
    LANGUAGE plpgsql
    AS $_$ 
DECLARE mark INTEGER;
BEGIN
    SELECT 2 INTO mark;
    IF EXISTS (SELECT * FROM Marks WHERE $1 BETWEEN LowBalls AND HighBalls) THEN 
        SELECT idMark INTO mark FROM Marks WHERE $1 BETWEEN LowBalls AND HighBalls;
    END IF;
    RETURN mark;
END;
$_$;


--
-- TOC entry 245 (class 1255 OID 24751)
-- Name: getmark4(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.getmark4(integer) RETURNS integer
    LANGUAGE plpgsql
    AS $_$ 
DECLARE res integer;
DECLARE mark integer; 
DECLARE lowB integer; 
DECLARE highB integer;
-- объявляем курсор
DECLARE mark_cursor CURSOR FOR SELECT * FROM Marks; 
BEGIN
    res := 2;
    OPEN mark_cursor; -- открываем курсор 
    LOOP -- начинаем цикл по курсору
        -- извлекаем данные из строки и записываем их в переменные 
        FETCH mark_cursor INTO mark, lowB, highB;
        
        -- если такого периода и не возникнет, то мы выходим
        IF NOT FOUND THEN EXIT; END IF;
        
        IF $1 BETWEEN lowB AND highB THEN
            res := mark;
        END IF;
    END LOOP; -- заканчиваем цикл по курсору 
    CLOSE mark_cursor; -- закрываем курсор 
    RETURN res;
END;
$_$;


--
-- TOC entry 244 (class 1255 OID 24735)
-- Name: iscorrect(integer, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.iscorrect(p_student_id integer, p_subject_id integer, p_semester_id integer, p_teacher_id integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM students WHERE student_id = p_student_id)
       AND EXISTS (SELECT 1 FROM subjects WHERE subject_id = p_subject_id)
       AND EXISTS (SELECT 1 FROM semesters WHERE semester_id = p_semester_id)
       AND EXISTS (SELECT 1 FROM teachers WHERE teacher_id = p_teacher_id);
END;
$$;


--
-- TOC entry 246 (class 1255 OID 24736)
-- Name: trigger_results_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_results_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF IsCorrect(NEW.student_id::integer, NEW.subject_id::integer,
                 NEW.semester_id::integer, NEW.teacher_id::integer) THEN
        -- Автоматически ставим дату сдачи, только если её не указали
        NEW.assessment_date := COALESCE(NEW.assessment_date, CURRENT_DATE);
    ELSE
        RAISE EXCEPTION 'Ошибка корректности данных: связанные справочники не найдены';
    END IF;
    RETURN NEW;
END;
$$;


--
-- TOC entry 258 (class 1255 OID 24749)
-- Name: trigger_results_insert_after(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_results_insert_after() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    sid BIGINT;
BEGIN
    -- Пересчитываем студента из новой строки (INSERT/UPDATE) ...
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        INSERT INTO public.reyting (idstudent, summ_balls)
        SELECT NEW.student_id, COALESCE(SUM(grade), 0)
        FROM public.student_performance
        WHERE student_id = NEW.student_id
        ON CONFLICT (idstudent) DO UPDATE SET summ_balls = EXCLUDED.summ_balls;
    END IF;
 
    -- ... и студента из старой строки (UPDATE со сменой студента / DELETE)
    IF TG_OP = 'DELETE'
       OR (TG_OP = 'UPDATE' AND OLD.student_id IS DISTINCT FROM NEW.student_id) THEN
        sid := OLD.student_id;
        INSERT INTO public.reyting (idstudent, summ_balls)
        SELECT sid, COALESCE(SUM(grade), 0)
        FROM public.student_performance
        WHERE student_id = sid
        ON CONFLICT (idstudent) DO UPDATE SET summ_balls = EXCLUDED.summ_balls;
    END IF;
 
    RETURN NULL;  -- для AFTER-триггера возвращаемое значение игнорируется
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 239 (class 1259 OID 25839)
-- Name: dim_date; Type: TABLE; Schema: analytics; Owner: -
--

CREATE TABLE analytics.dim_date (
    date_key integer NOT NULL,
    full_date date NOT NULL,
    calendar_year smallint NOT NULL,
    quarter_number smallint NOT NULL,
    month_number smallint NOT NULL,
    day_number smallint NOT NULL,
    iso_week smallint NOT NULL,
    loaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 25824)
-- Name: dim_semester; Type: TABLE; Schema: analytics; Owner: -
--

CREATE TABLE analytics.dim_semester (
    semester_key bigint NOT NULL,
    source_semester_id bigint NOT NULL,
    academic_year_start smallint NOT NULL,
    term_number smallint NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    loaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 25773)
-- Name: dim_student; Type: TABLE; Schema: analytics; Owner: -
--

CREATE TABLE analytics.dim_student (
    student_key bigint NOT NULL,
    source_student_id bigint NOT NULL,
    student_number character varying(20) NOT NULL,
    full_name text NOT NULL,
    birth_date date NOT NULL,
    email character varying(254),
    status character varying(30) NOT NULL,
    group_id bigint NOT NULL,
    group_code character varying(20) NOT NULL,
    group_name character varying(100) NOT NULL,
    education_program character varying(200) NOT NULL,
    admission_year smallint NOT NULL,
    loaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 236 (class 1259 OID 25795)
-- Name: dim_subject; Type: TABLE; Schema: analytics; Owner: -
--

CREATE TABLE analytics.dim_subject (
    subject_key bigint NOT NULL,
    source_subject_id bigint NOT NULL,
    subject_code character varying(20) NOT NULL,
    subject_name character varying(150) NOT NULL,
    total_hours smallint NOT NULL,
    credits numeric(4,1) NOT NULL,
    loaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 237 (class 1259 OID 25810)
-- Name: dim_teacher; Type: TABLE; Schema: analytics; Owner: -
--

CREATE TABLE analytics.dim_teacher (
    teacher_key bigint NOT NULL,
    source_teacher_id bigint NOT NULL,
    full_name text NOT NULL,
    email character varying(254),
    loaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 240 (class 1259 OID 25855)
-- Name: fact_performance; Type: TABLE; Schema: analytics; Owner: -
--

CREATE TABLE analytics.fact_performance (
    source_performance_id bigint NOT NULL,
    student_key bigint NOT NULL,
    subject_key bigint NOT NULL,
    teacher_key bigint NOT NULL,
    semester_key bigint NOT NULL,
    date_key integer NOT NULL,
    assessment_type character varying(30) NOT NULL,
    grade smallint,
    passed boolean,
    attempt_number smallint NOT NULL,
    record_count smallint DEFAULT 1 NOT NULL,
    loaded_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_fact_assessment_type CHECK (((assessment_type)::text = ANY ((ARRAY['exam'::character varying, 'credit'::character varying, 'differentiated_credit'::character varying, 'coursework'::character varying])::text[]))),
    CONSTRAINT chk_fact_attempt_number CHECK (((attempt_number >= 1) AND (attempt_number <= 3))),
    CONSTRAINT chk_fact_result CHECK (((((assessment_type)::text = 'credit'::text) AND (grade IS NULL) AND (passed IS NOT NULL)) OR (((assessment_type)::text <> 'credit'::text) AND ((grade >= 2) AND (grade <= 5)) AND (passed IS NULL))))
);


--
-- TOC entry 233 (class 1259 OID 24727)
-- Name: marks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marks (
    idmark integer NOT NULL,
    lowballs integer,
    highballs integer
);


--
-- TOC entry 234 (class 1259 OID 24738)
-- Name: reyting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reyting (
    idstudent bigint NOT NULL,
    summ_balls integer
);


--
-- TOC entry 220 (class 1259 OID 16536)
-- Name: semesters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.semesters (
    semester_id bigint NOT NULL,
    academic_year_start smallint NOT NULL,
    term_number smallint NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    CONSTRAINT chk_semesters_dates CHECK ((start_date < end_date)),
    CONSTRAINT chk_semesters_term CHECK ((term_number = ANY (ARRAY[1, 2]))),
    CONSTRAINT chk_semesters_year CHECK (((academic_year_start >= 2000) AND (academic_year_start <= 2100)))
);


--
-- TOC entry 221 (class 1259 OID 16547)
-- Name: semesters_semester_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.semesters ALTER COLUMN semester_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.semesters_semester_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 16548)
-- Name: student_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_groups (
    group_id bigint NOT NULL,
    group_code character varying(20) NOT NULL,
    group_name character varying(100) NOT NULL,
    education_program character varying(200) NOT NULL,
    admission_year smallint NOT NULL,
    CONSTRAINT chk_student_groups_admission_year CHECK (((admission_year >= 2000) AND (admission_year <= 2100)))
);


--
-- TOC entry 223 (class 1259 OID 16557)
-- Name: student_groups_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.student_groups ALTER COLUMN group_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.student_groups_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 16558)
-- Name: student_performance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_performance (
    performance_id bigint NOT NULL,
    student_id bigint NOT NULL,
    subject_id bigint NOT NULL,
    teacher_id bigint NOT NULL,
    semester_id bigint NOT NULL,
    assessment_type character varying(30) NOT NULL,
    grade smallint,
    passed boolean,
    attempt_number smallint DEFAULT 1 NOT NULL,
    assessment_date date NOT NULL,
    CONSTRAINT chk_performance_assessment_type CHECK (((assessment_type)::text = ANY (ARRAY[('exam'::character varying)::text, ('credit'::character varying)::text, ('differentiated_credit'::character varying)::text, ('coursework'::character varying)::text]))),
    CONSTRAINT chk_performance_attempt CHECK (((attempt_number >= 1) AND (attempt_number <= 3))),
    CONSTRAINT chk_performance_result CHECK (((((assessment_type)::text = ANY (ARRAY[('exam'::character varying)::text, ('differentiated_credit'::character varying)::text, ('coursework'::character varying)::text])) AND (grade IS NOT NULL) AND ((grade >= 2) AND (grade <= 5)) AND (passed IS NULL)) OR (((assessment_type)::text = 'credit'::text) AND (grade IS NULL) AND (passed IS NOT NULL))))
);


--
-- TOC entry 225 (class 1259 OID 16574)
-- Name: student_performance_performance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.student_performance ALTER COLUMN performance_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.student_performance_performance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 226 (class 1259 OID 16575)
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    student_id bigint NOT NULL,
    student_number character varying(20) NOT NULL,
    last_name character varying(50) NOT NULL,
    first_name character varying(50) NOT NULL,
    middle_name character varying(50),
    birth_date date NOT NULL,
    email character varying(254),
    status character varying(30) DEFAULT 'active'::character varying NOT NULL,
    group_id bigint NOT NULL,
    CONSTRAINT chk_students_birth_date CHECK (((birth_date >= '1900-01-01'::date) AND (birth_date <= '2100-12-31'::date))),
    CONSTRAINT chk_students_email CHECK (((email IS NULL) OR ((email)::text ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'::text))),
    CONSTRAINT chk_students_status CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('academic_leave'::character varying)::text, ('expelled'::character varying)::text, ('graduated'::character varying)::text])))
);


--
-- TOC entry 227 (class 1259 OID 16589)
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subjects (
    subject_id bigint NOT NULL,
    subject_code character varying(20) NOT NULL,
    subject_name character varying(150) NOT NULL,
    total_hours smallint NOT NULL,
    credits numeric(4,1) NOT NULL,
    CONSTRAINT chk_subjects_credits CHECK (((credits >= (0)::numeric) AND (credits <= (30)::numeric))),
    CONSTRAINT chk_subjects_hours CHECK ((total_hours > 0))
);


--
-- TOC entry 228 (class 1259 OID 16599)
-- Name: student_session; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.student_session AS
 SELECT students.last_name,
    students.first_name,
    subjects.subject_name
   FROM ((public.students
     JOIN public.student_performance ON ((students.student_id = student_performance.student_id)))
     JOIN public.subjects ON ((subjects.subject_id = student_performance.subject_id)))
  WHERE (student_performance.semester_id = 1);


--
-- TOC entry 229 (class 1259 OID 16604)
-- Name: students_student_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.students ALTER COLUMN student_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.students_student_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 230 (class 1259 OID 16605)
-- Name: subjects_subject_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.subjects ALTER COLUMN subject_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.subjects_subject_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 231 (class 1259 OID 16606)
-- Name: teachers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teachers (
    teacher_id bigint NOT NULL,
    last_name character varying(50) NOT NULL,
    first_name character varying(50) NOT NULL,
    middle_name character varying(50),
    email character varying(254),
    CONSTRAINT chk_teachers_email CHECK (((email IS NULL) OR ((email)::text ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'::text)))
);


--
-- TOC entry 232 (class 1259 OID 16613)
-- Name: teachers_teacher_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.teachers ALTER COLUMN teacher_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.teachers_teacher_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 5192 (class 0 OID 25839)
-- Dependencies: 239
-- Data for Name: dim_date; Type: TABLE DATA; Schema: analytics; Owner: -
--

INSERT INTO analytics.dim_date VALUES (20261224, '2026-12-24', 2026, 4, 12, 24, 52, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_date VALUES (20261010, '2026-10-10', 2026, 4, 10, 10, 41, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_date VALUES (20270119, '2027-01-19', 2027, 1, 1, 19, 3, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_date VALUES (20261225, '2026-12-25', 2026, 4, 12, 25, 52, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_date VALUES (20261223, '2026-12-23', 2026, 4, 12, 23, 52, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_date VALUES (20270115, '2027-01-15', 2027, 1, 1, 15, 2, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_date VALUES (20261222, '2026-12-22', 2026, 4, 12, 22, 52, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_date VALUES (20261221, '2026-12-21', 2026, 4, 12, 21, 52, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_date VALUES (20270123, '2027-01-23', 2027, 1, 1, 23, 3, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_date VALUES (20270111, '2027-01-11', 2027, 1, 1, 11, 2, '2026-10-19 22:55:33.936058+03');


--
-- TOC entry 5191 (class 0 OID 25824)
-- Dependencies: 238
-- Data for Name: dim_semester; Type: TABLE DATA; Schema: analytics; Owner: -
--

INSERT INTO analytics.dim_semester VALUES (1, 1, 2026, 1, '2026-09-01', '2027-01-31', '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_semester VALUES (2, 2, 2026, 2, '2027-02-09', '2027-07-15', '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_semester VALUES (3, 3, 2027, 1, '2027-09-01', '2028-01-31', '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_semester VALUES (4, 4, 2027, 2, '2028-02-09', '2028-07-15', '2026-10-19 22:55:33.936058+03');


--
-- TOC entry 5188 (class 0 OID 25773)
-- Dependencies: 235
-- Data for Name: dim_student; Type: TABLE DATA; Schema: analytics; Owner: -
--

INSERT INTO analytics.dim_student VALUES (1, 1, '2641-01', 'Власов Никита Евгеньевич', '2005-01-10', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (2, 2, '2641-02', 'Денисенко Александр Владимирович', '2005-02-12', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (3, 3, '2641-03', 'Баданин Денис Сергеевич', '2005-03-15', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (4, 4, '2641-04', 'Блиховой Дмитрий Геннадьевич', '2005-04-18', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (5, 5, '2641-05', 'Войтенко Виктор Юлианович', '2005-05-20', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (6, 6, '2641-06', 'Гераськин Игорь Александрович', '2005-06-22', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (7, 7, '2641-07', 'Голосун Иван Владимирович', '2005-07-25', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (8, 8, '2641-08', 'Грибков Дмитрий Евгеньевич', '2005-08-28', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (9, 9, '2641-09', 'Дьяченко Данил Романович', '2005-09-01', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (10, 10, '2641-10', 'Комаренко Егор Андреевич', '2005-10-05', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (11, 11, '2641-11', 'Копитун Дмитрий Михайлович', '2005-11-08', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (12, 12, '2641-12', 'Лукаш Кирилл Романович', '2005-12-10', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (13, 13, '2641-13', 'Марков Владислав Сергеевич', '2006-01-12', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (14, 14, '2641-14', 'Нитовкин Илья Дмитриевич', '2006-02-14', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (15, 15, '2641-15', 'Норенко Максим Андреевич', '2006-03-16', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (16, 16, '2641-16', 'Остриков Иван Андреевич', '2006-04-18', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (17, 17, '2641-17', 'Павлов Алексей Дмитриевич', '2006-05-20', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (18, 18, '2641-18', 'Пахтусов Егор Петрович', '2006-06-22', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (19, 19, '2641-19', 'Пучинин Павел Андреевич', '2006-07-25', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (20, 20, '2641-20', 'Пушенко Пётр Петрович', '2006-08-28', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (21, 21, '2641-21', 'Свистельник Руслан Русланович', '2006-09-02', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (22, 22, '2641-22', 'Селестин Джоадсон', '2006-10-05', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (23, 23, '2641-23', 'Смоляный Андрей Анатольевич', '2006-11-08', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (24, 24, '2641-24', 'Тараненко Вадим Витальевич', '2006-12-10', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (25, 25, '2641-25', 'Ткаченко Максим Андреевич', '2005-01-15', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (26, 26, '2641-26', 'Ушаков Олег Олегович', '2005-02-18', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (27, 27, '2641-27', 'Ханикерян Андрей Завенович', '2005-03-21', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (28, 28, '2641-28', 'Храбовченко Михаил Владимирович', '2005-04-24', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (29, 29, '2641-29', 'Царенок Владислав Михайлович', '2005-05-27', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (30, 30, '2641-30', 'Шипулин Семен Владимирович', '2005-06-30', NULL, 'active', 1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (31, 31, '2642-01', 'Аффуф Усамма Али', '2005-01-11', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (32, 32, '2642-02', 'Ахмедханов Кемаль Мураделиевич', '2005-02-13', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (33, 33, '2642-03', 'Бадов Кирилл Леонидович', '2005-03-16', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (34, 34, '2642-04', 'Будагов Никос Янисович', '2005-04-19', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (35, 35, '2642-05', 'Гетьман Валерий Романович', '2005-05-21', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (36, 36, '2642-06', 'Глоба Александр Валентинович', '2005-06-23', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (37, 37, '2642-07', 'Голодный Александр Александрович', '2005-07-26', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (38, 38, '2642-08', 'Голопёров Эдуард Вадимович', '2005-08-29', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (39, 39, '2642-09', 'Гугасян Альберт Артемович', '2005-09-02', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (40, 40, '2642-10', 'Жигайло Руслан Андреевич', '2005-10-06', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (41, 41, '2642-11', 'Знобищев Алексей Викторович', '2005-11-09', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (42, 42, '2642-12', 'Золотов Александр Юрьевич', '2005-12-11', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (43, 43, '2642-13', 'Кешишев Владислав Алексеевич', '2006-01-13', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (44, 44, '2642-14', 'Климов Дмитрий Алексеевич', '2006-02-15', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (45, 45, '2642-15', 'Ковалев Никита Андреевич', '2006-03-17', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (46, 46, '2642-16', 'Куренов Евгений Игоревич', '2006-04-19', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (47, 47, '2642-17', 'Литвинов Владислав Андреевич', '2006-05-21', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (48, 48, '2642-18', 'Логачев Богдан Андреевич', '2006-06-23', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (49, 49, '2642-19', 'Назлуханов Владимир Олегович', '2006-07-26', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (50, 50, '2642-20', 'Обруч Софья Евгеньевна', '2006-08-29', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (51, 51, '2642-21', 'Пристёгин Семен Эдуардович', '2006-09-03', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (52, 52, '2642-22', 'Рыбинцев Денис Витальевич', '2006-10-06', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (53, 53, '2642-23', 'Рябчук Владислав Дмитриевич', '2006-11-09', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (54, 54, '2642-24', 'Сейтмамбетов Эмиль Рамзесович', '2006-12-11', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (55, 55, '2642-25', 'Сурмачев Александр Викторович', '2005-01-16', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (56, 56, '2642-26', 'Цыбин Владислав Юрьевич', '2005-02-19', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (57, 57, '2642-27', 'Цылюрик Артем Александрович', '2005-03-22', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (58, 58, '2642-28', 'Шашлаков Александр Александрович', '2005-04-25', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (59, 59, '2642-29', 'Шепилов Сергей Андреевич', '2005-05-28', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_student VALUES (60, 60, '2642-30', 'Шкуро Илья Витальевич', '2005-07-01', NULL, 'active', 2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026, '2026-10-19 22:55:33.936058+03');


--
-- TOC entry 5189 (class 0 OID 25795)
-- Dependencies: 236
-- Data for Name: dim_subject; Type: TABLE DATA; Schema: analytics; Owner: -
--

INSERT INTO analytics.dim_subject VALUES (1, 1, 'ЭММУ', 'Экономико-математические модели управления', 108, 3.0, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_subject VALUES (2, 2, 'ББД', 'Базы и банки данных', 144, 4.0, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_subject VALUES (3, 3, 'ИИС', 'Инжиниринг информационных систем', 108, 3.0, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_subject VALUES (4, 4, 'ИЯ', 'Иностранный язык', 72, 2.0, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_subject VALUES (5, 5, 'ЛМН', 'Логика и методология науки', 72, 2.0, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_subject VALUES (6, 6, 'СГМ', 'Специальные главы математики', 144, 4.0, '2026-10-19 22:55:33.936058+03');


--
-- TOC entry 5190 (class 0 OID 25810)
-- Dependencies: 237
-- Data for Name: dim_teacher; Type: TABLE DATA; Schema: analytics; Owner: -
--

INSERT INTO analytics.dim_teacher VALUES (1, 1, 'Бурда Алексей Григорьевич', NULL, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_teacher VALUES (2, 2, 'Лукьяненко Татьяна Викторовна', NULL, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_teacher VALUES (3, 3, 'Русак Светлана Николаевна', NULL, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_teacher VALUES (4, 4, 'Карипиди Анна Генадиевна', NULL, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_teacher VALUES (5, 5, 'Плотников Валерий Валерьевич', NULL, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.dim_teacher VALUES (6, 6, 'Карманова Анна Валентиновна', NULL, '2026-10-19 22:55:33.936058+03');


--
-- TOC entry 5193 (class 0 OID 25855)
-- Dependencies: 240
-- Data for Name: fact_performance; Type: TABLE DATA; Schema: analytics; Owner: -
--

INSERT INTO analytics.fact_performance VALUES (7, 1, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (8, 2, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (9, 3, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (10, 4, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (11, 5, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (12, 6, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (13, 7, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (14, 8, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (15, 9, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (16, 10, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (17, 11, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (18, 12, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (19, 13, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (20, 14, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (21, 15, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (22, 16, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (23, 17, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (24, 18, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (25, 19, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (26, 20, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (27, 21, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (28, 22, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (29, 23, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (30, 24, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (31, 25, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (32, 26, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (33, 27, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (34, 28, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (35, 29, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (36, 30, 4, 4, 1, 20261221, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (37, 1, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (38, 2, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (39, 3, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (40, 4, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (41, 5, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (42, 6, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (43, 7, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (44, 8, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (45, 9, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (46, 10, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (47, 11, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (48, 12, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (49, 13, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (50, 14, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (51, 15, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (52, 16, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (53, 17, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (54, 18, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (55, 19, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (56, 20, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (57, 21, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (58, 22, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (59, 23, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (60, 24, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (61, 25, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (62, 26, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (63, 27, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (64, 28, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (65, 29, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (66, 30, 5, 5, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (67, 31, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (68, 32, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (69, 33, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (70, 34, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (71, 35, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (72, 36, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (73, 37, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (74, 38, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (75, 39, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (76, 40, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (77, 41, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (78, 42, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (79, 43, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (80, 44, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (81, 45, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (82, 46, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (83, 47, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (84, 48, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (85, 49, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (86, 50, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (87, 51, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (88, 52, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (89, 53, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (90, 54, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (91, 55, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (92, 56, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (93, 57, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (94, 58, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (95, 59, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (96, 60, 4, 4, 1, 20261222, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (97, 1, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (98, 2, 2, 2, 1, 20261223, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (99, 3, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (100, 4, 2, 2, 1, 20261223, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (101, 5, 2, 2, 1, 20261223, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (102, 6, 2, 2, 1, 20261223, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (103, 7, 2, 2, 1, 20261223, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (104, 8, 2, 2, 1, 20261223, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (105, 9, 2, 2, 1, 20261223, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (106, 10, 2, 2, 1, 20261223, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (107, 11, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (108, 12, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (109, 13, 2, 2, 1, 20261223, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (110, 14, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (111, 15, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (112, 16, 2, 2, 1, 20261223, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (113, 17, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (114, 18, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (115, 19, 2, 2, 1, 20261223, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (116, 20, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (117, 21, 2, 2, 1, 20261223, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (118, 22, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (119, 23, 2, 2, 1, 20261223, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (120, 24, 2, 2, 1, 20261223, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (121, 25, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (122, 26, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (123, 27, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (124, 28, 2, 2, 1, 20261223, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (125, 29, 2, 2, 1, 20261223, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (126, 30, 2, 2, 1, 20261223, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (127, 31, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (128, 32, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (129, 33, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (130, 34, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (131, 35, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (132, 36, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (133, 37, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (134, 38, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (135, 39, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (136, 40, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (137, 41, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (138, 42, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (139, 43, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (140, 44, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (141, 45, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (142, 46, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (143, 47, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (144, 48, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (145, 49, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (146, 50, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (147, 51, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (148, 52, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (149, 53, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (150, 54, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (151, 55, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (152, 56, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (153, 57, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (154, 58, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (155, 59, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (156, 60, 5, 5, 1, 20261223, 'credit', NULL, true, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (157, 1, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (158, 2, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (159, 3, 3, 3, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (160, 4, 3, 3, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (161, 5, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (162, 6, 3, 3, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (163, 7, 3, 3, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (164, 8, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (165, 9, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (166, 10, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (167, 11, 3, 3, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (168, 12, 3, 3, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (169, 13, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (170, 14, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (171, 15, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (172, 16, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (173, 17, 3, 3, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (174, 18, 3, 3, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (175, 19, 3, 3, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (176, 20, 3, 3, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (177, 21, 3, 3, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (178, 22, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (179, 23, 3, 3, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (180, 24, 3, 3, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (181, 25, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (182, 26, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (183, 27, 3, 3, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (184, 28, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (185, 29, 3, 3, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (186, 30, 3, 3, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (187, 31, 2, 2, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (188, 32, 2, 2, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (189, 33, 2, 2, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (190, 34, 2, 2, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (191, 35, 2, 2, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (192, 36, 2, 2, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (193, 37, 2, 2, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (194, 38, 2, 2, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (195, 39, 2, 2, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (196, 40, 2, 2, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (197, 41, 2, 2, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (198, 42, 2, 2, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (199, 43, 2, 2, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (200, 44, 2, 2, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (201, 45, 2, 2, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (202, 46, 2, 2, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (203, 47, 2, 2, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (204, 48, 2, 2, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (205, 49, 2, 2, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (206, 50, 2, 2, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (207, 51, 2, 2, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (208, 52, 2, 2, 1, 20261224, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (209, 53, 2, 2, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (210, 54, 2, 2, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (211, 55, 2, 2, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (212, 56, 2, 2, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (213, 57, 2, 2, 1, 20261224, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (214, 58, 2, 2, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (215, 59, 2, 2, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (216, 60, 2, 2, 1, 20261224, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (217, 31, 3, 3, 1, 20261225, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (218, 32, 3, 3, 1, 20261225, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (219, 33, 3, 3, 1, 20261225, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (220, 34, 3, 3, 1, 20261225, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (221, 35, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (222, 36, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (223, 37, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (224, 38, 3, 3, 1, 20261225, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (225, 39, 3, 3, 1, 20261225, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (226, 40, 3, 3, 1, 20261225, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (227, 41, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (228, 42, 3, 3, 1, 20261225, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (229, 43, 3, 3, 1, 20261225, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (230, 44, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (231, 45, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (232, 46, 3, 3, 1, 20261225, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (233, 47, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (234, 48, 3, 3, 1, 20261225, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (235, 49, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (236, 50, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (237, 51, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (238, 52, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (239, 53, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (240, 54, 3, 3, 1, 20261225, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (241, 55, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (242, 56, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (243, 57, 3, 3, 1, 20261225, 'coursework', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (244, 58, 3, 3, 1, 20261225, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (245, 59, 3, 3, 1, 20261225, 'coursework', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (246, 60, 3, 3, 1, 20261225, 'coursework', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (247, 1, 1, 1, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (248, 2, 1, 1, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (249, 3, 1, 1, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (250, 4, 1, 1, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (251, 5, 1, 1, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (252, 6, 1, 1, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (253, 7, 1, 1, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (254, 8, 1, 1, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (255, 9, 1, 1, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (256, 10, 1, 1, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (257, 11, 1, 1, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (258, 12, 1, 1, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (259, 13, 1, 1, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (260, 14, 1, 1, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (261, 15, 1, 1, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (262, 16, 1, 1, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (263, 17, 1, 1, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (264, 18, 1, 1, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (265, 19, 1, 1, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (266, 20, 1, 1, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (267, 21, 1, 1, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (268, 22, 1, 1, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (269, 23, 1, 1, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (270, 24, 1, 1, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (271, 25, 1, 1, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (272, 26, 1, 1, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (273, 27, 1, 1, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (274, 28, 1, 1, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (275, 29, 1, 1, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (276, 30, 1, 1, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (277, 31, 2, 2, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (278, 32, 2, 2, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (279, 33, 2, 2, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (280, 34, 2, 2, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (281, 35, 2, 2, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (282, 36, 2, 2, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (283, 37, 2, 2, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (284, 38, 2, 2, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (285, 39, 2, 2, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (286, 40, 2, 2, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (287, 41, 2, 2, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (288, 42, 2, 2, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (289, 43, 2, 2, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (290, 44, 2, 2, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (291, 45, 2, 2, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (292, 46, 2, 2, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (293, 47, 2, 2, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (294, 48, 2, 2, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (295, 49, 2, 2, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (296, 50, 2, 2, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (297, 51, 2, 2, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (298, 52, 2, 2, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (299, 53, 2, 2, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (300, 54, 2, 2, 1, 20270111, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (301, 55, 2, 2, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (302, 56, 2, 2, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (303, 57, 2, 2, 1, 20270111, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (304, 58, 2, 2, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (305, 59, 2, 2, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (306, 60, 2, 2, 1, 20270111, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (307, 1, 2, 2, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (308, 2, 2, 2, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (309, 3, 2, 2, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (310, 4, 2, 2, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (311, 5, 2, 2, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (312, 6, 2, 2, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (313, 7, 2, 2, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (314, 8, 2, 2, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (315, 9, 2, 2, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (316, 10, 2, 2, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (317, 11, 2, 2, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (318, 12, 2, 2, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (319, 13, 2, 2, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (320, 14, 2, 2, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (321, 15, 2, 2, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (322, 16, 2, 2, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (323, 17, 2, 2, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (324, 18, 2, 2, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (325, 19, 2, 2, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (326, 20, 2, 2, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (327, 21, 2, 2, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (328, 22, 2, 2, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (329, 23, 2, 2, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (330, 24, 2, 2, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (331, 25, 2, 2, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (332, 26, 2, 2, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (333, 27, 2, 2, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (334, 28, 2, 2, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (335, 29, 2, 2, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (336, 30, 2, 2, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (337, 31, 3, 3, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (338, 32, 3, 3, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (339, 33, 3, 3, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (340, 34, 3, 3, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (341, 35, 3, 3, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (342, 36, 3, 3, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (343, 37, 3, 3, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (344, 38, 3, 3, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (345, 39, 3, 3, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (346, 40, 3, 3, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (347, 41, 3, 3, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (348, 42, 3, 3, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (349, 43, 3, 3, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (350, 44, 3, 3, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (351, 45, 3, 3, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (352, 46, 3, 3, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (353, 47, 3, 3, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (354, 48, 3, 3, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (355, 49, 3, 3, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (356, 50, 3, 3, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (357, 51, 3, 3, 1, 20270115, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (358, 52, 3, 3, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (359, 53, 3, 3, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (360, 54, 3, 3, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (361, 55, 3, 3, 1, 20270115, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (362, 56, 3, 3, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (363, 57, 3, 3, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (364, 58, 3, 3, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (365, 59, 3, 3, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (366, 60, 3, 3, 1, 20270115, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (367, 1, 3, 3, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (368, 2, 3, 3, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (369, 3, 3, 3, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (370, 4, 3, 3, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (371, 5, 3, 3, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (372, 6, 3, 3, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (373, 7, 3, 3, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (374, 8, 3, 3, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (375, 9, 3, 3, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (376, 10, 3, 3, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (377, 11, 3, 3, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (378, 12, 3, 3, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (379, 13, 3, 3, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (380, 14, 3, 3, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (381, 15, 3, 3, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (382, 16, 3, 3, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (383, 17, 3, 3, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (384, 18, 3, 3, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (385, 19, 3, 3, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (386, 20, 3, 3, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (387, 21, 3, 3, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (388, 22, 3, 3, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (389, 23, 3, 3, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (390, 24, 3, 3, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (391, 25, 3, 3, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (392, 26, 3, 3, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (393, 27, 3, 3, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (394, 28, 3, 3, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (395, 29, 3, 3, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (396, 30, 3, 3, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (397, 31, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (398, 32, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (399, 33, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (400, 34, 6, 6, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (401, 35, 6, 6, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (402, 36, 6, 6, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (403, 37, 6, 6, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (404, 38, 6, 6, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (405, 39, 6, 6, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (406, 40, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (407, 41, 6, 6, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (408, 42, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (409, 43, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (410, 44, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (411, 45, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (412, 46, 6, 6, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (413, 47, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (414, 48, 6, 6, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (415, 49, 6, 6, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (416, 50, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (417, 51, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (418, 52, 6, 6, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (419, 53, 6, 6, 1, 20270119, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (420, 54, 6, 6, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (421, 55, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (422, 56, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (423, 57, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (424, 58, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (425, 59, 6, 6, 1, 20270119, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (426, 60, 6, 6, 1, 20270119, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (427, 1, 6, 6, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (428, 2, 6, 6, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (429, 3, 6, 6, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (430, 4, 6, 6, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (431, 5, 6, 6, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (432, 6, 6, 6, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (433, 7, 6, 6, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (434, 8, 6, 6, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (435, 9, 6, 6, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (436, 10, 6, 6, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (437, 11, 6, 6, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (438, 12, 6, 6, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (440, 14, 6, 6, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (441, 15, 6, 6, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (442, 16, 6, 6, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (443, 17, 6, 6, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (444, 18, 6, 6, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (445, 19, 6, 6, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (446, 20, 6, 6, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (447, 21, 6, 6, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (449, 23, 6, 6, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (450, 24, 6, 6, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (451, 25, 6, 6, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (452, 26, 6, 6, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (453, 27, 6, 6, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (454, 28, 6, 6, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (455, 29, 6, 6, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (456, 30, 6, 6, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (457, 31, 1, 1, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (458, 32, 1, 1, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (459, 33, 1, 1, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (460, 34, 1, 1, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (461, 35, 1, 1, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (462, 36, 1, 1, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (463, 37, 1, 1, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (464, 38, 1, 1, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (465, 39, 1, 1, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (466, 40, 1, 1, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (467, 41, 1, 1, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (468, 42, 1, 1, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (469, 43, 1, 1, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (470, 44, 1, 1, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (471, 45, 1, 1, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (472, 46, 1, 1, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (473, 47, 1, 1, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (474, 48, 1, 1, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (475, 49, 1, 1, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (476, 50, 1, 1, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (477, 51, 1, 1, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (478, 52, 1, 1, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (479, 53, 1, 1, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (480, 54, 1, 1, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (481, 55, 1, 1, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (482, 56, 1, 1, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (483, 57, 1, 1, 1, 20270123, 'exam', 3, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (484, 58, 1, 1, 1, 20270123, 'exam', 4, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (485, 59, 1, 1, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (486, 60, 1, 1, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (490, 1, 3, 3, 1, 20261010, 'exam', 5, NULL, 2, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (491, 1, 1, 1, 1, 20261010, 'exam', 4, NULL, 2, 1, '2026-10-19 22:55:33.936058+03');
INSERT INTO analytics.fact_performance VALUES (448, 22, 6, 6, 1, 20270123, 'exam', 5, NULL, 1, 1, '2026-10-19 22:55:33.936058+03');


--
-- TOC entry 5186 (class 0 OID 24727)
-- Dependencies: 233
-- Data for Name: marks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.marks VALUES (3, 55, 70);
INSERT INTO public.marks VALUES (4, 71, 85);
INSERT INTO public.marks VALUES (5, 86, 100);


--
-- TOC entry 5187 (class 0 OID 24738)
-- Dependencies: 234
-- Data for Name: reyting; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.reyting VALUES (54, 26);
INSERT INTO public.reyting VALUES (29, 22);
INSERT INTO public.reyting VALUES (4, 25);
INSERT INTO public.reyting VALUES (34, 24);
INSERT INTO public.reyting VALUES (51, 21);
INSERT INTO public.reyting VALUES (52, 22);
INSERT INTO public.reyting VALUES (10, 20);
INSERT INTO public.reyting VALUES (35, 24);
INSERT INTO public.reyting VALUES (45, 22);
INSERT INTO public.reyting VALUES (6, 26);
INSERT INTO public.reyting VALUES (39, 25);
INSERT INTO public.reyting VALUES (36, 25);
INSERT INTO public.reyting VALUES (31, 25);
INSERT INTO public.reyting VALUES (50, 22);
INSERT INTO public.reyting VALUES (60, 28);
INSERT INTO public.reyting VALUES (14, 21);
INSERT INTO public.reyting VALUES (13, 17);
INSERT INTO public.reyting VALUES (2, 21);
INSERT INTO public.reyting VALUES (16, 24);
INSERT INTO public.reyting VALUES (44, 23);
INSERT INTO public.reyting VALUES (11, 25);
INSERT INTO public.reyting VALUES (42, 26);
INSERT INTO public.reyting VALUES (41, 24);
INSERT INTO public.reyting VALUES (46, 21);
INSERT INTO public.reyting VALUES (40, 25);
INSERT INTO public.reyting VALUES (43, 24);
INSERT INTO public.reyting VALUES (53, 27);
INSERT INTO public.reyting VALUES (32, 22);
INSERT INTO public.reyting VALUES (9, 22);
INSERT INTO public.reyting VALUES (7, 24);
INSERT INTO public.reyting VALUES (38, 27);
INSERT INTO public.reyting VALUES (15, 20);
INSERT INTO public.reyting VALUES (48, 25);
INSERT INTO public.reyting VALUES (26, 22);
INSERT INTO public.reyting VALUES (12, 24);
INSERT INTO public.reyting VALUES (57, 24);
INSERT INTO public.reyting VALUES (24, 22);
INSERT INTO public.reyting VALUES (19, 24);
INSERT INTO public.reyting VALUES (25, 24);
INSERT INTO public.reyting VALUES (30, 24);
INSERT INTO public.reyting VALUES (21, 25);
INSERT INTO public.reyting VALUES (49, 28);
INSERT INTO public.reyting VALUES (47, 21);
INSERT INTO public.reyting VALUES (3, 24);
INSERT INTO public.reyting VALUES (17, 25);
INSERT INTO public.reyting VALUES (37, 23);
INSERT INTO public.reyting VALUES (28, 22);
INSERT INTO public.reyting VALUES (20, 25);
INSERT INTO public.reyting VALUES (33, 23);
INSERT INTO public.reyting VALUES (1, 31);
INSERT INTO public.reyting VALUES (5, 21);
INSERT INTO public.reyting VALUES (18, 21);
INSERT INTO public.reyting VALUES (55, 25);
INSERT INTO public.reyting VALUES (27, 27);
INSERT INTO public.reyting VALUES (23, 25);
INSERT INTO public.reyting VALUES (56, 26);
INSERT INTO public.reyting VALUES (8, 22);
INSERT INTO public.reyting VALUES (59, 25);
INSERT INTO public.reyting VALUES (58, 25);
INSERT INTO public.reyting VALUES (22, 20);


--
-- TOC entry 5174 (class 0 OID 16536)
-- Dependencies: 220
-- Data for Name: semesters; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.semesters OVERRIDING SYSTEM VALUE VALUES (1, 2026, 1, '2026-09-01', '2027-01-31');
INSERT INTO public.semesters OVERRIDING SYSTEM VALUE VALUES (2, 2026, 2, '2027-02-09', '2027-07-15');
INSERT INTO public.semesters OVERRIDING SYSTEM VALUE VALUES (3, 2027, 1, '2027-09-01', '2028-01-31');
INSERT INTO public.semesters OVERRIDING SYSTEM VALUE VALUES (4, 2027, 2, '2028-02-09', '2028-07-15');


--
-- TOC entry 5176 (class 0 OID 16548)
-- Dependencies: 222
-- Data for Name: student_groups; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.student_groups OVERRIDING SYSTEM VALUE VALUES (1, 'ИТ2641', 'Группа ИТ2641', 'Информационные системы и технологии', 2026);
INSERT INTO public.student_groups OVERRIDING SYSTEM VALUE VALUES (2, 'ИТ2642', 'Группа ИТ2642', 'Информационные системы и технологии', 2026);


--
-- TOC entry 5178 (class 0 OID 16558)
-- Dependencies: 224
-- Data for Name: student_performance; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (7, 1, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (8, 2, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (9, 3, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (10, 4, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (11, 5, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (12, 6, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (13, 7, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (14, 8, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (15, 9, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (16, 10, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (17, 11, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (18, 12, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (19, 13, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (20, 14, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (21, 15, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (22, 16, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (23, 17, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (24, 18, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (25, 19, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (26, 20, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (27, 21, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (28, 22, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (29, 23, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (30, 24, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (31, 25, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (32, 26, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (33, 27, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (34, 28, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (35, 29, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (36, 30, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-21');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (37, 1, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (38, 2, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (39, 3, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (40, 4, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (41, 5, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (42, 6, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (43, 7, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (44, 8, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (45, 9, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (46, 10, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (47, 11, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (48, 12, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (49, 13, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (50, 14, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (51, 15, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (52, 16, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (53, 17, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (54, 18, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (55, 19, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (56, 20, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (57, 21, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (58, 22, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (59, 23, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (60, 24, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (61, 25, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (62, 26, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (63, 27, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (64, 28, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (65, 29, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (66, 30, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (67, 31, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (68, 32, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (69, 33, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (70, 34, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (71, 35, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (72, 36, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (73, 37, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (74, 38, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (75, 39, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (76, 40, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (77, 41, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (78, 42, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (79, 43, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (80, 44, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (81, 45, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (82, 46, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (83, 47, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (84, 48, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (85, 49, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (86, 50, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (87, 51, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (88, 52, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (89, 53, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (90, 54, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (91, 55, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (92, 56, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (93, 57, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (94, 58, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (95, 59, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (96, 60, 4, 4, 1, 'credit', NULL, true, 1, '2026-12-22');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (97, 1, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (98, 2, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (99, 3, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (100, 4, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (101, 5, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (102, 6, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (103, 7, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (104, 8, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (105, 9, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (106, 10, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (107, 11, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (108, 12, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (109, 13, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (110, 14, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (111, 15, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (112, 16, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (113, 17, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (114, 18, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (115, 19, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (116, 20, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (117, 21, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (118, 22, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (119, 23, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (120, 24, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (121, 25, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (122, 26, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (123, 27, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (124, 28, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (125, 29, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (126, 30, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (127, 31, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (128, 32, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (129, 33, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (130, 34, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (131, 35, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (132, 36, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (133, 37, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (134, 38, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (135, 39, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (136, 40, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (137, 41, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (138, 42, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (139, 43, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (140, 44, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (141, 45, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (142, 46, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (143, 47, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (144, 48, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (145, 49, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (146, 50, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (147, 51, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (148, 52, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (149, 53, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (150, 54, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (151, 55, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (152, 56, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (153, 57, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (154, 58, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (155, 59, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (156, 60, 5, 5, 1, 'credit', NULL, true, 1, '2026-12-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (157, 1, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (158, 2, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (159, 3, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (160, 4, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (161, 5, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (162, 6, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (163, 7, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (164, 8, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (165, 9, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (166, 10, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (167, 11, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (168, 12, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (169, 13, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (170, 14, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (171, 15, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (172, 16, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (173, 17, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (174, 18, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (175, 19, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (176, 20, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (177, 21, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (178, 22, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (179, 23, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (180, 24, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (181, 25, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (182, 26, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (183, 27, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (184, 28, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (185, 29, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (186, 30, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (187, 31, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (188, 32, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (189, 33, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (190, 34, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (191, 35, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (192, 36, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (193, 37, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (194, 38, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (195, 39, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (196, 40, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (197, 41, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (198, 42, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (199, 43, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (200, 44, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (201, 45, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (202, 46, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (203, 47, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (204, 48, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (205, 49, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (206, 50, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (207, 51, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (208, 52, 2, 2, 1, 'coursework', 3, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (209, 53, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (210, 54, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (211, 55, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (212, 56, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (213, 57, 2, 2, 1, 'coursework', 5, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (214, 58, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (215, 59, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (216, 60, 2, 2, 1, 'coursework', 4, NULL, 1, '2026-12-24');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (217, 31, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (218, 32, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (219, 33, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (220, 34, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (221, 35, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (222, 36, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (223, 37, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (224, 38, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (225, 39, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (226, 40, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (227, 41, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (228, 42, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (229, 43, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (230, 44, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (231, 45, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (232, 46, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (233, 47, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (234, 48, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (235, 49, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (236, 50, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (237, 51, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (238, 52, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (239, 53, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (240, 54, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (241, 55, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (242, 56, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (243, 57, 3, 3, 1, 'coursework', 4, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (244, 58, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (245, 59, 3, 3, 1, 'coursework', 3, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (246, 60, 3, 3, 1, 'coursework', 5, NULL, 1, '2026-12-25');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (247, 1, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (248, 2, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (249, 3, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (250, 4, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (251, 5, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (252, 6, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (253, 7, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (254, 8, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (255, 9, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (256, 10, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (257, 11, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (258, 12, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (259, 13, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (260, 14, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (261, 15, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (262, 16, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (263, 17, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (264, 18, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (265, 19, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (266, 20, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (267, 21, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (268, 22, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (269, 23, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (270, 24, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (271, 25, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (272, 26, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (273, 27, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (274, 28, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (275, 29, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (276, 30, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (277, 31, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (278, 32, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (279, 33, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (280, 34, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (281, 35, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (282, 36, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (283, 37, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (284, 38, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (285, 39, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (286, 40, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (287, 41, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (288, 42, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (289, 43, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (290, 44, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (291, 45, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (292, 46, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (293, 47, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (294, 48, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (295, 49, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (296, 50, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (297, 51, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (298, 52, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (299, 53, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (300, 54, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (301, 55, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (302, 56, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (303, 57, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (304, 58, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (305, 59, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (306, 60, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-11');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (307, 1, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (308, 2, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (309, 3, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (310, 4, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (311, 5, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (312, 6, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (313, 7, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (314, 8, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (315, 9, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (316, 10, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (317, 11, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (318, 12, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (319, 13, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (320, 14, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (321, 15, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (322, 16, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (323, 17, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (324, 18, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (325, 19, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (326, 20, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (327, 21, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (328, 22, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (329, 23, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (330, 24, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (331, 25, 2, 2, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (332, 26, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (333, 27, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (334, 28, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (335, 29, 2, 2, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (336, 30, 2, 2, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (337, 31, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (338, 32, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (339, 33, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (340, 34, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (341, 35, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (342, 36, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (343, 37, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (344, 38, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (345, 39, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (346, 40, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (347, 41, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (348, 42, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (349, 43, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (350, 44, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (351, 45, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (352, 46, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (353, 47, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (354, 48, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (355, 49, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (356, 50, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (357, 51, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (358, 52, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (359, 53, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (360, 54, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (361, 55, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (362, 56, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (363, 57, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (364, 58, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (365, 59, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (366, 60, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-15');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (367, 1, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (368, 2, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (369, 3, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (370, 4, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (371, 5, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (372, 6, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (373, 7, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (374, 8, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (375, 9, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (376, 10, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (377, 11, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (378, 12, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (379, 13, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (380, 14, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (381, 15, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (382, 16, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (383, 17, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (384, 18, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (385, 19, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (386, 20, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (387, 21, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (388, 22, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (389, 23, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (390, 24, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (391, 25, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (392, 26, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (393, 27, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (394, 28, 3, 3, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (395, 29, 3, 3, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (396, 30, 3, 3, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (397, 31, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (398, 32, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (399, 33, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (400, 34, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (401, 35, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (402, 36, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (403, 37, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (404, 38, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (405, 39, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (406, 40, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (407, 41, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (408, 42, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (409, 43, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (410, 44, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (411, 45, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (412, 46, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (413, 47, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (414, 48, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (415, 49, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (416, 50, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (417, 51, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (418, 52, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (419, 53, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (420, 54, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (421, 55, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (422, 56, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (423, 57, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (424, 58, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (425, 59, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (426, 60, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-19');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (427, 1, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (428, 2, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (429, 3, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (430, 4, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (431, 5, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (432, 6, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (433, 7, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (434, 8, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (435, 9, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (436, 10, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (437, 11, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (438, 12, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (440, 14, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (441, 15, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (442, 16, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (443, 17, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (444, 18, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (445, 19, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (446, 20, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (447, 21, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (449, 23, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (450, 24, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (451, 25, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (452, 26, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (453, 27, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (454, 28, 6, 6, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (455, 29, 6, 6, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (456, 30, 6, 6, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (457, 31, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (458, 32, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (459, 33, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (460, 34, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (461, 35, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (462, 36, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (463, 37, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (464, 38, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (465, 39, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (466, 40, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (467, 41, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (468, 42, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (469, 43, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (470, 44, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (471, 45, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (472, 46, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (473, 47, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (474, 48, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (475, 49, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (476, 50, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (477, 51, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (478, 52, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (479, 53, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (480, 54, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (481, 55, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (482, 56, 1, 1, 1, 'exam', 4, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (483, 57, 1, 1, 1, 'exam', 3, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (486, 60, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (490, 1, 3, 3, 1, 'exam', 5, NULL, 2, '2026-10-10');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (491, 1, 1, 1, 1, 'exam', 4, NULL, 2, '2026-10-10');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (485, 59, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (484, 58, 1, 1, 1, 'exam', 5, NULL, 1, '2027-01-23');
INSERT INTO public.student_performance OVERRIDING SYSTEM VALUE VALUES (448, 22, 6, 6, 1, 'exam', 2, NULL, 1, '2027-01-23');


--
-- TOC entry 5180 (class 0 OID 16575)
-- Dependencies: 226
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (1, '2641-01', 'Власов', 'Никита', 'Евгеньевич', '2005-01-10', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (2, '2641-02', 'Денисенко', 'Александр', 'Владимирович', '2005-02-12', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (3, '2641-03', 'Баданин', 'Денис', 'Сергеевич', '2005-03-15', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (4, '2641-04', 'Блиховой', 'Дмитрий', 'Геннадьевич', '2005-04-18', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (5, '2641-05', 'Войтенко', 'Виктор', 'Юлианович', '2005-05-20', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (6, '2641-06', 'Гераськин', 'Игорь', 'Александрович', '2005-06-22', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (7, '2641-07', 'Голосун', 'Иван', 'Владимирович', '2005-07-25', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (8, '2641-08', 'Грибков', 'Дмитрий', 'Евгеньевич', '2005-08-28', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (9, '2641-09', 'Дьяченко', 'Данил', 'Романович', '2005-09-01', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (10, '2641-10', 'Комаренко', 'Егор', 'Андреевич', '2005-10-05', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (11, '2641-11', 'Копитун', 'Дмитрий', 'Михайлович', '2005-11-08', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (12, '2641-12', 'Лукаш', 'Кирилл', 'Романович', '2005-12-10', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (13, '2641-13', 'Марков', 'Владислав', 'Сергеевич', '2006-01-12', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (14, '2641-14', 'Нитовкин', 'Илья', 'Дмитриевич', '2006-02-14', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (15, '2641-15', 'Норенко', 'Максим', 'Андреевич', '2006-03-16', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (16, '2641-16', 'Остриков', 'Иван', 'Андреевич', '2006-04-18', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (17, '2641-17', 'Павлов', 'Алексей', 'Дмитриевич', '2006-05-20', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (18, '2641-18', 'Пахтусов', 'Егор', 'Петрович', '2006-06-22', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (19, '2641-19', 'Пучинин', 'Павел', 'Андреевич', '2006-07-25', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (20, '2641-20', 'Пушенко', 'Пётр', 'Петрович', '2006-08-28', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (21, '2641-21', 'Свистельник', 'Руслан', 'Русланович', '2006-09-02', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (22, '2641-22', 'Селестин', 'Джоадсон', NULL, '2006-10-05', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (23, '2641-23', 'Смоляный', 'Андрей', 'Анатольевич', '2006-11-08', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (24, '2641-24', 'Тараненко', 'Вадим', 'Витальевич', '2006-12-10', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (25, '2641-25', 'Ткаченко', 'Максим', 'Андреевич', '2005-01-15', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (26, '2641-26', 'Ушаков', 'Олег', 'Олегович', '2005-02-18', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (27, '2641-27', 'Ханикерян', 'Андрей', 'Завенович', '2005-03-21', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (28, '2641-28', 'Храбовченко', 'Михаил', 'Владимирович', '2005-04-24', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (29, '2641-29', 'Царенок', 'Владислав', 'Михайлович', '2005-05-27', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (30, '2641-30', 'Шипулин', 'Семен', 'Владимирович', '2005-06-30', NULL, 'active', 1);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (31, '2642-01', 'Аффуф', 'Усамма', 'Али', '2005-01-11', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (32, '2642-02', 'Ахмедханов', 'Кемаль', 'Мураделиевич', '2005-02-13', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (33, '2642-03', 'Бадов', 'Кирилл', 'Леонидович', '2005-03-16', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (34, '2642-04', 'Будагов', 'Никос', 'Янисович', '2005-04-19', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (35, '2642-05', 'Гетьман', 'Валерий', 'Романович', '2005-05-21', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (36, '2642-06', 'Глоба', 'Александр', 'Валентинович', '2005-06-23', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (37, '2642-07', 'Голодный', 'Александр', 'Александрович', '2005-07-26', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (38, '2642-08', 'Голопёров', 'Эдуард', 'Вадимович', '2005-08-29', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (39, '2642-09', 'Гугасян', 'Альберт', 'Артемович', '2005-09-02', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (40, '2642-10', 'Жигайло', 'Руслан', 'Андреевич', '2005-10-06', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (42, '2642-12', 'Золотов', 'Александр', 'Юрьевич', '2005-12-11', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (43, '2642-13', 'Кешишев', 'Владислав', 'Алексеевич', '2006-01-13', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (44, '2642-14', 'Климов', 'Дмитрий', 'Алексеевич', '2006-02-15', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (45, '2642-15', 'Ковалев', 'Никита', 'Андреевич', '2006-03-17', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (46, '2642-16', 'Куренов', 'Евгений', 'Игоревич', '2006-04-19', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (47, '2642-17', 'Литвинов', 'Владислав', 'Андреевич', '2006-05-21', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (48, '2642-18', 'Логачев', 'Богдан', 'Андреевич', '2006-06-23', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (49, '2642-19', 'Назлуханов', 'Владимир', 'Олегович', '2006-07-26', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (50, '2642-20', 'Обруч', 'Софья', 'Евгеньевна', '2006-08-29', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (51, '2642-21', 'Пристёгин', 'Семен', 'Эдуардович', '2006-09-03', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (52, '2642-22', 'Рыбинцев', 'Денис', 'Витальевич', '2006-10-06', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (53, '2642-23', 'Рябчук', 'Владислав', 'Дмитриевич', '2006-11-09', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (54, '2642-24', 'Сейтмамбетов', 'Эмиль', 'Рамзесович', '2006-12-11', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (55, '2642-25', 'Сурмачев', 'Александр', 'Викторович', '2005-01-16', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (56, '2642-26', 'Цыбин', 'Владислав', 'Юрьевич', '2005-02-19', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (57, '2642-27', 'Цылюрик', 'Артем', 'Александрович', '2005-03-22', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (58, '2642-28', 'Шашлаков', 'Александр', 'Александрович', '2005-04-25', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (59, '2642-29', 'Шепилов', 'Сергей', 'Андреевич', '2005-05-28', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (60, '2642-30', 'Шкуро', 'Илья', 'Витальевич', '2005-07-01', NULL, 'active', 2);
INSERT INTO public.students OVERRIDING SYSTEM VALUE VALUES (41, '2642-11', 'Знобищев', 'Алексей', 'Викторович', '2004-12-09', NULL, 'active', 2);


--
-- TOC entry 5181 (class 0 OID 16589)
-- Dependencies: 227
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.subjects OVERRIDING SYSTEM VALUE VALUES (1, 'ЭММУ', 'Экономико-математические модели управления', 108, 3.0);
INSERT INTO public.subjects OVERRIDING SYSTEM VALUE VALUES (2, 'ББД', 'Базы и банки данных', 144, 4.0);
INSERT INTO public.subjects OVERRIDING SYSTEM VALUE VALUES (3, 'ИИС', 'Инжиниринг информационных систем', 108, 3.0);
INSERT INTO public.subjects OVERRIDING SYSTEM VALUE VALUES (4, 'ИЯ', 'Иностранный язык', 72, 2.0);
INSERT INTO public.subjects OVERRIDING SYSTEM VALUE VALUES (5, 'ЛМН', 'Логика и методология науки', 72, 2.0);
INSERT INTO public.subjects OVERRIDING SYSTEM VALUE VALUES (6, 'СГМ', 'Специальные главы математики', 144, 4.0);


--
-- TOC entry 5184 (class 0 OID 16606)
-- Dependencies: 231
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.teachers OVERRIDING SYSTEM VALUE VALUES (1, 'Бурда', 'Алексей', 'Григорьевич', NULL);
INSERT INTO public.teachers OVERRIDING SYSTEM VALUE VALUES (2, 'Лукьяненко', 'Татьяна', 'Викторовна', NULL);
INSERT INTO public.teachers OVERRIDING SYSTEM VALUE VALUES (3, 'Русак', 'Светлана', 'Николаевна', NULL);
INSERT INTO public.teachers OVERRIDING SYSTEM VALUE VALUES (4, 'Карипиди', 'Анна', 'Генадиевна', NULL);
INSERT INTO public.teachers OVERRIDING SYSTEM VALUE VALUES (5, 'Плотников', 'Валерий', 'Валерьевич', NULL);
INSERT INTO public.teachers OVERRIDING SYSTEM VALUE VALUES (6, 'Карманова', 'Анна', 'Валентиновна', NULL);


--
-- TOC entry 5199 (class 0 OID 0)
-- Dependencies: 221
-- Name: semesters_semester_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.semesters_semester_id_seq', 4, true);


--
-- TOC entry 5200 (class 0 OID 0)
-- Dependencies: 223
-- Name: student_groups_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_groups_group_id_seq', 3, true);


--
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 225
-- Name: student_performance_performance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_performance_performance_id_seq', 491, true);


--
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 229
-- Name: students_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.students_student_id_seq', 62, true);


--
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 230
-- Name: subjects_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subjects_subject_id_seq', 6, true);


--
-- TOC entry 5204 (class 0 OID 0)
-- Dependencies: 232
-- Name: teachers_teacher_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.teachers_teacher_id_seq', 6, true);


--
-- TOC entry 5003 (class 2606 OID 25854)
-- Name: dim_date dim_date_full_date_key; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.dim_date
    ADD CONSTRAINT dim_date_full_date_key UNIQUE (full_date);


--
-- TOC entry 5005 (class 2606 OID 25852)
-- Name: dim_date dim_date_pkey; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.dim_date
    ADD CONSTRAINT dim_date_pkey PRIMARY KEY (date_key);


--
-- TOC entry 4999 (class 2606 OID 25836)
-- Name: dim_semester dim_semester_pkey; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.dim_semester
    ADD CONSTRAINT dim_semester_pkey PRIMARY KEY (semester_key);


--
-- TOC entry 5001 (class 2606 OID 25838)
-- Name: dim_semester dim_semester_source_semester_id_key; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.dim_semester
    ADD CONSTRAINT dim_semester_source_semester_id_key UNIQUE (source_semester_id);


--
-- TOC entry 4987 (class 2606 OID 25792)
-- Name: dim_student dim_student_pkey; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.dim_student
    ADD CONSTRAINT dim_student_pkey PRIMARY KEY (student_key);


--
-- TOC entry 4989 (class 2606 OID 25794)
-- Name: dim_student dim_student_source_student_id_key; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.dim_student
    ADD CONSTRAINT dim_student_source_student_id_key UNIQUE (source_student_id);


--
-- TOC entry 4991 (class 2606 OID 25807)
-- Name: dim_subject dim_subject_pkey; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.dim_subject
    ADD CONSTRAINT dim_subject_pkey PRIMARY KEY (subject_key);


--
-- TOC entry 4993 (class 2606 OID 25809)
-- Name: dim_subject dim_subject_source_subject_id_key; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.dim_subject
    ADD CONSTRAINT dim_subject_source_subject_id_key UNIQUE (source_subject_id);


--
-- TOC entry 4995 (class 2606 OID 25821)
-- Name: dim_teacher dim_teacher_pkey; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.dim_teacher
    ADD CONSTRAINT dim_teacher_pkey PRIMARY KEY (teacher_key);


--
-- TOC entry 4997 (class 2606 OID 25823)
-- Name: dim_teacher dim_teacher_source_teacher_id_key; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.dim_teacher
    ADD CONSTRAINT dim_teacher_source_teacher_id_key UNIQUE (source_teacher_id);


--
-- TOC entry 5007 (class 2606 OID 25874)
-- Name: fact_performance fact_performance_pkey; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.fact_performance
    ADD CONSTRAINT fact_performance_pkey PRIMARY KEY (source_performance_id);


--
-- TOC entry 4983 (class 2606 OID 24732)
-- Name: marks marks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marks
    ADD CONSTRAINT marks_pkey PRIMARY KEY (idmark);


--
-- TOC entry 4985 (class 2606 OID 24743)
-- Name: reyting reyting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reyting
    ADD CONSTRAINT reyting_pkey PRIMARY KEY (idstudent);


--
-- TOC entry 4951 (class 2606 OID 16615)
-- Name: semesters semesters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT semesters_pkey PRIMARY KEY (semester_id);


--
-- TOC entry 4955 (class 2606 OID 16617)
-- Name: student_groups student_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_groups
    ADD CONSTRAINT student_groups_pkey PRIMARY KEY (group_id);


--
-- TOC entry 4963 (class 2606 OID 16619)
-- Name: student_performance student_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_performance
    ADD CONSTRAINT student_performance_pkey PRIMARY KEY (performance_id);


--
-- TOC entry 4969 (class 2606 OID 16621)
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);


--
-- TOC entry 4973 (class 2606 OID 16623)
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (subject_id);


--
-- TOC entry 4979 (class 2606 OID 16625)
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (teacher_id);


--
-- TOC entry 4953 (class 2606 OID 16627)
-- Name: semesters uq_semesters_year_term; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT uq_semesters_year_term UNIQUE (academic_year_start, term_number);


--
-- TOC entry 4957 (class 2606 OID 16629)
-- Name: student_groups uq_student_groups_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_groups
    ADD CONSTRAINT uq_student_groups_code UNIQUE (group_code);


--
-- TOC entry 4965 (class 2606 OID 16631)
-- Name: student_performance uq_student_performance; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_performance
    ADD CONSTRAINT uq_student_performance UNIQUE (student_id, subject_id, semester_id, assessment_type, attempt_number);


--
-- TOC entry 4971 (class 2606 OID 16633)
-- Name: students uq_students_number; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT uq_students_number UNIQUE (student_number);


--
-- TOC entry 4975 (class 2606 OID 16635)
-- Name: subjects uq_subjects_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT uq_subjects_code UNIQUE (subject_code);


--
-- TOC entry 4977 (class 2606 OID 16637)
-- Name: subjects uq_subjects_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT uq_subjects_name UNIQUE (subject_name);


--
-- TOC entry 4981 (class 2606 OID 16639)
-- Name: teachers uq_teachers_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT uq_teachers_email UNIQUE (email);


--
-- TOC entry 5008 (class 1259 OID 25904)
-- Name: ix_fact_performance_date; Type: INDEX; Schema: analytics; Owner: -
--

CREATE INDEX ix_fact_performance_date ON analytics.fact_performance USING btree (date_key);


--
-- TOC entry 5009 (class 1259 OID 25903)
-- Name: ix_fact_performance_semester; Type: INDEX; Schema: analytics; Owner: -
--

CREATE INDEX ix_fact_performance_semester ON analytics.fact_performance USING btree (semester_key);


--
-- TOC entry 5010 (class 1259 OID 25901)
-- Name: ix_fact_performance_student; Type: INDEX; Schema: analytics; Owner: -
--

CREATE INDEX ix_fact_performance_student ON analytics.fact_performance USING btree (student_key);


--
-- TOC entry 5011 (class 1259 OID 25900)
-- Name: ix_fact_performance_subject; Type: INDEX; Schema: analytics; Owner: -
--

CREATE INDEX ix_fact_performance_subject ON analytics.fact_performance USING btree (subject_key);


--
-- TOC entry 5012 (class 1259 OID 25902)
-- Name: ix_fact_performance_teacher; Type: INDEX; Schema: analytics; Owner: -
--

CREATE INDEX ix_fact_performance_teacher ON analytics.fact_performance USING btree (teacher_key);


--
-- TOC entry 4958 (class 1259 OID 16640)
-- Name: idx_performance_semester_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_performance_semester_id ON public.student_performance USING btree (semester_id);


--
-- TOC entry 4959 (class 1259 OID 16641)
-- Name: idx_performance_student_semester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_performance_student_semester ON public.student_performance USING btree (student_id, semester_id);


--
-- TOC entry 4960 (class 1259 OID 16642)
-- Name: idx_performance_subject_semester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_performance_subject_semester ON public.student_performance USING btree (subject_id, semester_id);


--
-- TOC entry 4961 (class 1259 OID 16643)
-- Name: idx_performance_teacher_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_performance_teacher_id ON public.student_performance USING btree (teacher_id);


--
-- TOC entry 4966 (class 1259 OID 16644)
-- Name: idx_students_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_group_id ON public.students USING btree (group_id);


--
-- TOC entry 4967 (class 1259 OID 16645)
-- Name: idx_students_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_name ON public.students USING btree (last_name, first_name);


--
-- TOC entry 5024 (class 2620 OID 24737)
-- Name: student_performance tr_results_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_results_insert BEFORE INSERT ON public.student_performance FOR EACH ROW EXECUTE FUNCTION public.trigger_results_insert();


--
-- TOC entry 5025 (class 2620 OID 25771)
-- Name: student_performance tr_results_insert_after; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_results_insert_after AFTER INSERT OR DELETE OR UPDATE ON public.student_performance FOR EACH ROW EXECUTE FUNCTION public.trigger_results_insert_after();


--
-- TOC entry 5019 (class 2606 OID 25895)
-- Name: fact_performance fact_performance_date_key_fkey; Type: FK CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.fact_performance
    ADD CONSTRAINT fact_performance_date_key_fkey FOREIGN KEY (date_key) REFERENCES analytics.dim_date(date_key);


--
-- TOC entry 5020 (class 2606 OID 25890)
-- Name: fact_performance fact_performance_semester_key_fkey; Type: FK CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.fact_performance
    ADD CONSTRAINT fact_performance_semester_key_fkey FOREIGN KEY (semester_key) REFERENCES analytics.dim_semester(semester_key);


--
-- TOC entry 5021 (class 2606 OID 25875)
-- Name: fact_performance fact_performance_student_key_fkey; Type: FK CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.fact_performance
    ADD CONSTRAINT fact_performance_student_key_fkey FOREIGN KEY (student_key) REFERENCES analytics.dim_student(student_key);


--
-- TOC entry 5022 (class 2606 OID 25880)
-- Name: fact_performance fact_performance_subject_key_fkey; Type: FK CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.fact_performance
    ADD CONSTRAINT fact_performance_subject_key_fkey FOREIGN KEY (subject_key) REFERENCES analytics.dim_subject(subject_key);


--
-- TOC entry 5023 (class 2606 OID 25885)
-- Name: fact_performance fact_performance_teacher_key_fkey; Type: FK CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.fact_performance
    ADD CONSTRAINT fact_performance_teacher_key_fkey FOREIGN KEY (teacher_key) REFERENCES analytics.dim_teacher(teacher_key);


--
-- TOC entry 5018 (class 2606 OID 24744)
-- Name: reyting fk_reyting; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reyting
    ADD CONSTRAINT fk_reyting FOREIGN KEY (idstudent) REFERENCES public.students(student_id);


--
-- TOC entry 5013 (class 2606 OID 16646)
-- Name: student_performance student_performance_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_performance
    ADD CONSTRAINT student_performance_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(semester_id) ON DELETE RESTRICT;


--
-- TOC entry 5014 (class 2606 OID 16651)
-- Name: student_performance student_performance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_performance
    ADD CONSTRAINT student_performance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE RESTRICT;


--
-- TOC entry 5015 (class 2606 OID 16656)
-- Name: student_performance student_performance_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_performance
    ADD CONSTRAINT student_performance_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE RESTRICT;


--
-- TOC entry 5016 (class 2606 OID 16661)
-- Name: student_performance student_performance_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_performance
    ADD CONSTRAINT student_performance_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(teacher_id) ON DELETE RESTRICT;


--
-- TOC entry 5017 (class 2606 OID 16666)
-- Name: students students_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.student_groups(group_id) ON DELETE RESTRICT;


-- Completed on 2026-10-20 22:42:25

--
-- PostgreSQL database dump complete
--

\unrestrict 9QP4ax0sEqx9uwrWsLqV6SCQe9Oggn4yhy3B3hCyUaMs5p2tNKstoukd4Xg0wH0

