<script lang="ts">
	import { page } from '$app/stores';
	import { guildPath } from '$lib/api/paths';

	interface Props {
		rsn: string;
	}
	let { rsn }: Props = $props();

	let guildId = $derived($page.params.guild_id as string | undefined);
</script>

<a class="chip" href={guildPath(guildId, `/users/${encodeURIComponent(rsn)}`)}>
	{rsn}
</a>
