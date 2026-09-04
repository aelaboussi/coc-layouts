import { HallType } from "./types";

/**
 * Short, original per-level commentary shown at the top of each listing
 * page (app/[hall]/[level]/page.tsx) — a few sentences on what changes
 * strategically at that Town Hall, not just a repeated description of the
 * raw dataset. Written from general, publicly known game mechanics, not
 * copied from any single source.
 */
const TH_NOTES: Record<number, string> = {
  4: "Town Hall 4 is where Air Defense first appears, so bases need at least one placed centrally rather than leaning on ground defenses alone. Most attacks at this level are still resource raids, so protecting storages matters more than a flawless compartment layout.",
  5: "The Wizard Tower comes online at Town Hall 5 and punishes grouped troops with splash damage, which is why funneling attackers into its range is a bigger factor in base design here than at earlier levels.",
  6: "Town Hall 6 adds the Air Sweeper, a knockback device that can push incoming air troops back out — placement near your Air Defenses does more for survivability than raw wall count at this stage.",
  7: "Dark Elixir storage and the Hidden Tesla both unlock at Town Hall 7, opening up hero training and giving defenders a surprise burst defense — hiding the Tesla behind compartments rather than in the open is the main new consideration.",
  8: "The Bomb Tower arrives at Town Hall 8 and is particularly effective against grouped ground swarms, making it a strong pick to protect against Giant/Minion or mass-Barbarian style raids.",
  9: "Town Hall 9 introduces the X-Bow, an automated long-range defense that keeps firing even while you're offline — centralizing it changes how attackers have to path in, and it's usually one of the first buildings worth protecting.",
  10: "Town Hall 10 is a major defensive turning point thanks to the Inferno Tower, whose damage ramps up the longer it locks onto a single target — this is the level where dedicated anti-tank base design really starts to matter.",
  11: "The Eagle Artillery unlocks at Town Hall 11 and automatically targets whichever attacking force is currently strongest, which pushes a lot of base designs toward spreading out high-value defenses rather than clustering them.",
  12: "Town Hall 12 activates the Giga Tesla inside the Town Hall itself, turning it into a genuine last-line defense, while Siege Machines give attackers new ways to break into the core — both sides of the base need rethinking here.",
  13: "Scattershot arrives at Town Hall 13 as a heavy anti-air splash defense and the Town Hall's own weapon upgrades to Giga Inferno, making air attacks noticeably riskier and core protection even more important.",
  14: "Town Hall 14 introduces Hero Pets, giving heroes a combat companion that adds another layer to both offense and defense — base design itself changes less here than attack strategy does.",
  15: "The Monolith unlocks at Town Hall 15, a beam defense that periodically unleashes a large area-damage burst — placing it where it can catch grouped troops is usually more valuable than maximizing its single-target uptime.",
  16: "Town Hall 16 introduces building merges, combining Archer Towers into a Multi-Archer Tower and Cannons into a Ricochet Cannon — fewer, stronger buildings means compartment design has to account for bigger point-defense losses if one falls.",
  17: "Town Hall 17 adds the Firespitter, an aimable rapid-fire defense, alongside the option to merge the Town Hall with the Eagle Artillery into Inferno Artillery — a build that trades some flexibility for concentrated firepower.",
  18: "Town Hall 18 brings standalone Guardian defenders and an escalating Revenge Tower, both of which reward attackers for overcommitting — bases here increasingly need to plan around punishing a rushed or repeated assault, not just a single wave.",
};

export function getLevelNote(hallType: HallType, level: number): string | undefined {
  if (hallType !== "th") return undefined;
  return TH_NOTES[level];
}
