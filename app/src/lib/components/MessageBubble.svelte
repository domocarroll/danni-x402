<script lang="ts">
	import type { ChatMessage } from '$lib/stores/chat.svelte';

	interface Props {
		message: ChatMessage;
	}

	let { message }: Props = $props();

	const time = $derived(
		new Date(message.timestamp).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		})
	);
</script>

<div class="bubble" class:user={message.role === 'user'} class:assistant={message.role === 'assistant'}>
	<div class="avatar">
		{#if message.role === 'user'}
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<circle cx="12" cy="8" r="4" />
				<path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
			</svg>
		{:else}
			<span class="danni-avatar">D</span>
		{/if}
	</div>
	<div class="content">
		<div class="meta">
			<span class="role">{message.role === 'user' ? 'You' : 'Danni'}</span>
			<span class="time">{time}</span>
		</div>
		<div class="text">{message.content}</div>
	</div>
</div>

<style>
	.bubble {
		display: flex;
		gap: 0.75rem;
		padding: 1rem 0;
		animation: fadeIn 0.3s ease-out;
	}

	.user {
		flex-direction: row-reverse;
	}

	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background: #1a1a1a;
		color: #888;
	}

	.assistant .avatar {
		background: rgba(99, 102, 241, 0.15);
		color: #6366f1;
	}

	.danni-avatar {
		font-size: 0.875rem;
		font-weight: 600;
	}

	.content {
		max-width: 70%;
	}

	.user .content {
		text-align: right;
	}

	.meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	.user .meta {
		flex-direction: row-reverse;
	}

	.role {
		font-size: 0.75rem;
		font-weight: 600;
		color: #888;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.time {
		font-size: 0.7rem;
		color: #555;
	}

	.text {
		font-size: 0.9375rem;
		line-height: 1.6;
		color: #ddd;
		background: #111;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		border: 1px solid #1a1a1a;
	}

	.user .text {
		background: rgba(99, 102, 241, 0.1);
		border-color: rgba(99, 102, 241, 0.2);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
