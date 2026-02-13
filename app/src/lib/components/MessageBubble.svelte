<script lang="ts">
	import type { ChatMessage } from '$lib/stores/chat.svelte';
	import { marked } from 'marked';

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

	const renderedContent = $derived(
		message.role === 'assistant'
			? marked.parse(message.content, { async: false, gfm: true, breaks: true }) as string
			: ''
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
		{#if message.role === 'assistant'}
			<div class="text markdown-body">{@html renderedContent}</div>
		{:else}
			<div class="text">{message.content}</div>
		{/if}
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

	/* Markdown rendered content styles */
	.markdown-body :global(h1),
	.markdown-body :global(h2),
	.markdown-body :global(h3),
	.markdown-body :global(h4) {
		font-weight: 600;
		margin: 1rem 0 0.5rem;
		color: #fafafa;
	}

	.markdown-body :global(h1) { font-size: 1.25rem; }
	.markdown-body :global(h2) { font-size: 1.125rem; }
	.markdown-body :global(h3) { font-size: 1rem; }
	.markdown-body :global(h4) { font-size: 0.9375rem; }

	.markdown-body :global(h1:first-child),
	.markdown-body :global(h2:first-child),
	.markdown-body :global(h3:first-child),
	.markdown-body :global(h4:first-child) {
		margin-top: 0;
	}

	.markdown-body :global(p) {
		margin: 0.5rem 0;
	}

	.markdown-body :global(p:first-child) {
		margin-top: 0;
	}

	.markdown-body :global(p:last-child) {
		margin-bottom: 0;
	}

	.markdown-body :global(ul),
	.markdown-body :global(ol) {
		padding-left: 1.5rem;
		margin: 0.5rem 0;
	}

	.markdown-body :global(li) {
		margin: 0.25rem 0;
	}

	.markdown-body :global(code) {
		font-family: 'SF Mono', 'Fira Code', monospace;
		font-size: 0.85em;
		padding: 0.15em 0.4em;
		background: rgba(99, 102, 241, 0.1);
		border: 1px solid rgba(99, 102, 241, 0.15);
		border-radius: 0.25rem;
		color: #a5b4fc;
	}

	.markdown-body :global(pre) {
		margin: 0.75rem 0;
		padding: 1rem;
		background: #0a0a0a;
		border: 1px solid #1a1a1a;
		border-radius: 0.5rem;
		overflow-x: auto;
	}

	.markdown-body :global(pre code) {
		padding: 0;
		background: none;
		border: none;
		font-size: 0.8125rem;
		color: #ccc;
	}

	.markdown-body :global(blockquote) {
		margin: 0.75rem 0;
		padding: 0.5rem 1rem;
		border-left: 3px solid #6366f1;
		color: #aaa;
		font-style: italic;
	}

	.markdown-body :global(strong) {
		color: #fafafa;
		font-weight: 600;
	}

	.markdown-body :global(em) {
		color: #bbb;
	}

	.markdown-body :global(hr) {
		border: none;
		border-top: 1px solid #1a1a1a;
		margin: 1rem 0;
	}

	.markdown-body :global(a) {
		color: #6366f1;
		text-decoration: underline;
		text-decoration-color: rgba(99, 102, 241, 0.3);
		text-underline-offset: 2px;
		transition: text-decoration-color 0.2s;
	}

	.markdown-body :global(a:hover) {
		text-decoration-color: #6366f1;
	}

	.markdown-body :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 0.75rem 0;
		font-size: 0.875rem;
	}

	.markdown-body :global(th),
	.markdown-body :global(td) {
		padding: 0.5rem 0.75rem;
		border: 1px solid #1a1a1a;
		text-align: left;
	}

	.markdown-body :global(th) {
		background: rgba(99, 102, 241, 0.05);
		font-weight: 600;
		color: #ccc;
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
