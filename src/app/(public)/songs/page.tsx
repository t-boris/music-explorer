import { getSongs, getAllSongTags } from "@/lib/content";
import { SongFilter } from "@/components/content/song-filter";

export const metadata = {
  title: "Compositions & Riffs | Music Explorer",
  description:
    "Browse songs and compositions tagged with the theory concepts they demonstrate.",
};

export default function SongsPage() {
  const songs = getSongs();
  const allTags = getAllSongTags();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
          Compositions & Riffs
        </h1>
        <p className="mt-2 text-text-secondary">
          Explore songs and compositions linked to theory concepts. Each song
          shows which musical ideas it demonstrates, helping you connect theory
          to real playing.
        </p>
      </div>

      <SongFilter songs={songs} allTags={allTags} />
    </main>
  );
}
