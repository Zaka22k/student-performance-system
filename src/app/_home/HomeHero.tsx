import styles from "./Home.module.css";

const SUBJECTS = [
  { name: "Математика", kind: "Экзамен", grade: "5", tone: "excellent" },
  { name: "Базы данных", kind: "Экзамен", grade: "4", tone: "good" },
  { name: "Разработка ПО", kind: "Зачёт", grade: "✓", tone: "passed" },
] as const;

export default function HomeHero() {
  return (
    <div className={styles.hero} aria-hidden="true">
      <svg
        className={styles.heroSvg}
        viewBox="0 0 1120 260"
        width="1120"
        height="260"
        preserveAspectRatio="xMinYMid meet"
        focusable="false"
      >
        <defs>
          <linearGradient id="hero-book-cover" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className={styles.coverStart} />
            <stop offset="1" className={styles.coverEnd} />
          </linearGradient>
          <linearGradient id="hero-paper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className={styles.paperStart} />
            <stop offset="1" className={styles.paperEnd} />
          </linearGradient>
        </defs>

        {/* Иллюстрация раскрытой книги — остаётся заметной под навигацией. */}
        <circle className={styles.bookAura} cx="132" cy="130" r="112" />
        <circle className={styles.bookRing} cx="132" cy="130" r="91" />
        <circle className={styles.bookRingInner} cx="132" cy="130" r="72" />

        <g className={styles.bookShadow}>
          <path
            className={styles.bookCover}
            d="M55 102c27-17 53-15 77 1v75c-25-15-51-17-77-1z"
          />
          <path
            className={styles.bookCover}
            d="M132 103c25-16 51-18 77-1v75c-26-16-52-14-77 1z"
          />
          <path
            className={styles.bookPages}
            d="M63 106c23-11 44-10 63 2v57c-20-11-41-13-63-3z"
          />
          <path
            className={styles.bookPages}
            d="M138 108c19-12 40-13 63-2v56c-22-10-43-8-63 3z"
          />
        </g>
        <path className={styles.bookSpine} d="M132 103v75" />
        <path className={styles.bookLine} d="M77 119c14-5 27-4 38 2M77 132c14-5 27-4 38 2M77 145c14-5 27-4 38 2" />
        <path className={styles.bookLine} d="M149 121c13-6 26-7 40-3M149 134c13-6 26-7 40-3M149 147c13-6 26-7 40-3" />
        <circle className={styles.bookSeal} cx="192" cy="78" r="19" />
        <path className={styles.bookSealCheck} d="m184 78 5 5 11-12" />
        <circle className={styles.bookDot} cx="42" cy="177" r="5" />
        <circle className={styles.bookDotSoft} cx="218" cy="166" r="8" />

        {/* Учебная ведомость — основной объект hero. */}
        <g className={styles.paperShadow}>
          <rect
            className={styles.heroPaper}
            x="270"
            y="27"
            width="678"
            height="207"
            rx="20"
          />
          <path
            className={styles.paperCorner}
            d="M917 27h11a20 20 0 0 1 20 20v11z"
          />
        </g>

        <rect className={styles.documentIconBg} x="294" y="46" width="42" height="42" rx="12" />
        <path className={styles.documentIcon} d="M306 57h11l7 7v15h-18z" />
        <path className={styles.documentIconFold} d="M317 57v7h7M310 69h10M310 74h10" />

        <text className={styles.documentEyebrow} x="350" y="59">
          ЭЛЕКТРОННЫЙ ЖУРНАЛ
        </text>
        <text className={styles.documentTitle} x="350" y="80">
          Учебная ведомость
        </text>

        <rect className={styles.semesterChip} x="795" y="52" width="126" height="28" rx="14" />
        <circle className={styles.semesterDot} cx="812" cy="66" r="4" />
        <text className={styles.semesterText} x="824" y="70">
          СЕМЕСТР 01
        </text>

        <line className={styles.documentDivider} x1="294" y1="101" x2="923" y2="101" />

        <text className={styles.tableHeader} x="305" y="122">
          ДИСЦИПЛИНА
        </text>
        <text className={styles.tableHeader} x="680" y="122">
          ФОРМА
        </text>
        <text className={styles.tableHeader} x="808" y="122">
          РЕЗУЛЬТАТ
        </text>

        {SUBJECTS.map((subject, index) => {
          const y = 150 + index * 27;
          return (
            <g key={subject.name}>
              {index > 0 && (
                <line
                  className={styles.tableDivider}
                  x1="294"
                  x2="923"
                  y1={y - 16}
                  y2={y - 16}
                />
              )}
              <circle
                className={styles.subjectDot}
                cx="309"
                cy={y - 4}
                r="3.5"
              />
              <text className={styles.subjectName} x="322" y={y}>
                {subject.name}
              </text>
              <text className={styles.subjectKind} x="680" y={y}>
                {subject.kind}
              </text>
              <rect
                className={styles.gradePill}
                data-tone={subject.tone}
                x="810"
                y={y - 18}
                width="44"
                height="24"
                rx="8"
              />
              <text
                className={styles.gradeValue}
                data-tone={subject.tone}
                x="832"
                y={y - 1}
                textAnchor="middle"
              >
                {subject.grade}
              </text>
            </g>
          );
        })}

        {/* Небольшая печать завершённой ведомости справа от листа. */}
        <g className={styles.statusCard}>
          <rect x="970" y="78" width="126" height="104" rx="18" />
          <circle cx="1033" cy="111" r="19" />
          <path d="m1025 111 6 6 11-13" />
          <text x="1033" y="150" textAnchor="middle">
            РЕЗУЛЬТАТЫ
          </text>
          <text x="1033" y="165" textAnchor="middle">
            УЧТЕНЫ
          </text>
        </g>

        <path className={styles.decorativeStroke} d="M1000 44c22-16 47-16 69 0" />
        <circle className={styles.decorativeDot} cx="1081" cy="205" r="4" />
        <circle className={styles.decorativeDotSoft} cx="1059" cy="218" r="3" />
      </svg>
    </div>
  );
}
