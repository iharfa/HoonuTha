"use client";
import Link from "next/link";
import { CityScene, AlbedoScene, TreeScene, DetectiveSun, Icon } from "@/components/Art";
import { Card, Btn } from "@/components/ui";

const LESSONS = [
  {
    id: "uhi", icon: "city", title: "The Urban Heat Island", Art: CityScene,
    body: [
      "Cities and towns are often several degrees hotter than the green areas around them. Scientists call this the Urban Heat Island effect.",
      "Roads, roofs and pavements are dark and hard. They soak up the sun all day and slowly release the heat all night, so the city never fully cools down.",
      "In the Maldives, where it's already hot and humid, this makes streets and playgrounds uncomfortable — and it makes us use more air-conditioning, which uses more energy.",
    ],
    fact: "Dark asphalt can be 20–30°C hotter than the air on a sunny day.",
  },
  {
    id: "albedo", icon: "albedo", title: "Albedo — bright bounces, dark soaks", Art: AlbedoScene,
    body: [
      "Albedo is a measure of how much sunlight a surface reflects, from 0 (soaks up everything) to 1 (a perfect mirror).",
      "White sand and white paint have high albedo, so they bounce sunlight away and stay cooler. Black sand, asphalt and dark rubber have low albedo, so they trap the heat.",
      "This is why the colour of a surface matters so much — and why painting roofs and pavements in light colours can cool a whole neighbourhood.",
    ],
    fact: "Just changing a surface from black to white can drop its temperature by more than 20°C.",
  },
  {
    id: "trees", icon: "tree", title: "Trees & evapotranspiration", Art: TreeScene,
    body: [
      "Trees cool cities in two ways. First, their leaves make shade, so the ground below never gets baked by direct sun.",
      "Second, they do something amazing called evapotranspiration: they pull water up from the soil and release it as vapour through their leaves. Turning water into vapour uses up heat — just like sweating cools your skin.",
      "Together, shade + evapotranspiration can make the air under a tree noticeably cooler. Planting trees is one of the best ways to fight the heat island.",
    ],
    fact: "A single large tree can release hundreds of litres of water a day, cooling the air around it.",
  },
  {
    id: "materials", icon: "layers", title: "Why materials differ",
    body: [
      "Different materials handle the sun differently. Sand is loose and light-coloured, so it reflects a lot and doesn't hold heat deep down.",
      "Asphalt and concrete are dark and dense — they store heat like a battery and let it out slowly. Rubber playground surfaces can get the hottest of all when they're dark.",
      "Living surfaces like grass stay coolest because plants reflect some light AND use water to cool themselves.",
    ],
    fact: "Your own readings prove this — check the 'Average heat by surface' chart in My Data!",
  },
];

export default function Learn() {
  return (
    <div className="pt-4">
      <Card tint className="flex items-center gap-3">
        <DetectiveSun size={56} />
        <div>
          <h1 className="font-display text-lg font-extrabold text-[var(--color-ink)]">The science of a hot city</h1>
          <p className="mt-0.5 text-sm text-[var(--color-ink-2)]">Four short ideas that explain everything you're measuring.</p>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {LESSONS.map((l) => (
          <Card key={l.id} className="overflow-hidden p-0">
            {l.Art && <l.Art className="w-full" />}
            <div className="p-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-[var(--color-ink)]">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-sun)]"><Icon name={l.icon} size={18} /></span>
                {l.title}
              </h2>
              {l.body.map((p, i) => (
                <p key={i} className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">{p}</p>
              ))}
              <div className="mt-3 flex items-start gap-2 rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-sun)] p-3 text-sm text-[var(--color-ink)]">
                <span className="mt-0.5 shrink-0"><Icon name="bulb" size={18} /></span><span><b>Did you know?</b> {l.fact}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-4 text-center">
        <p className="font-display text-sm font-extrabold text-[var(--color-ink)]">Ready to test it yourself?</p>
        <div className="mt-2 flex justify-center gap-2">
          <Link href="/measure"><Btn>Measure</Btn></Link>
          <Link href="/guide"><Btn variant="soft">Field Guide</Btn></Link>
        </div>
      </Card>
    </div>
  );
}
