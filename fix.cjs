const fs = require('fs');
const glob = require('glob');

function fix(content) {
	return content
		.replace(/\(b: any\) =>/g, '(b: any) =>') // Keep this if valid, but let's fix the broken ones
		.replace(/\(u: any =>/g, '(u: any) =>') // Fix missing closing parenthesis
		.replace(/\(e: any\) => e\./g, '(e: any) => e.') // Just ensure standard spacing
		// Fix Profile Events derive logic which broke badly
		.replace(/let eventWins = \$derived\(events\.filter\(e: any\) => e\.placement === 1\)\.length\);/g, 'let eventWins = $derived(events.filter((e: any) => e.placement === 1).length);')
		.replace(/let eventSeconds = \$derived\(events\.filter\(e: any\) => e\.placement === 2\)\.length\);/g, 'let eventSeconds = $derived(events.filter((e: any) => e.placement === 2).length);')
		.replace(/let eventThirds = \$derived\(events\.filter\(e: any\) => e\.placement === 3\)\.length\);/g, 'let eventThirds = $derived(events.filter((e: any) => e.placement === 3).length);')
		.replace(/let bingoWins = \$derived\(bingos\.filter\(e: any\) => e\.placement === 1\)\.length\);/g, 'let bingoWins = $derived(bingos.filter((e: any) => e.placement === 1).length);')
		// Fix Server Loader Maps which broke badly
		.replace(/leaderboard\.map\(u: any => \(\{/g, 'leaderboard.map((u: any) => ({')
		.replace(/events\.find\(e: any\) => e\.wom_id/g, 'events.find((e: any) => e.wom_id');
}

const files = glob.sync('src/routes/**/*.{ts,svelte}');
for (const file of files) {
	const text = fs.readFileSync(file, 'utf8');
	const fixed = fix(text);
	if (text !== fixed) {
		fs.writeFileSync(file, fixed, 'utf8');
	}
}
