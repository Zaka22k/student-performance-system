import { getRating } from "@/actions/analytics";
import RatingPageView from "./RatingPageView";

export default async function RatingPage() {
  const initialItems = await getRating("");

  return <RatingPageView initialItems={initialItems} />;
}
