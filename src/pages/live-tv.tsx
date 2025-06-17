import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import channels from '@/data/channels.json';
import { useTranslation } from 'react-i18next';

const categories = [
	{ label: 'All', value: '' },
	{ label: 'Uncategorized', value: 'uncategorized' },
	{ label: 'News', value: 'news' },
	{ label: 'Sports', value: 'sports' },
	{ label: 'Entertainment', value: 'entertainment' },
	{ label: 'Movies', value: 'movies' },
	{ label: 'Kids', value: 'kids' },
	{ label: 'Music', value: 'music' },
	{ label: 'Lifestyle', value: 'lifestyle' },
	{ label: 'Local', value: 'local' },
	{ label: 'International', value: 'international' },
	{ label: 'Comedy', value: 'comedy' },
	{ label: 'Adult', value: 'adult' },
	{ label: 'Cultural', value: 'cultural' },
	{ label: 'Weather', value: 'weather' },
	{ label: 'Health-Fitness', value: 'health-fitness' },
	{ label: 'Documentary', value: 'documentary' },
	{ label: 'basic cable', value: 'basic cable' },
	{ label: 'reality', value: 'reality' },
	{ label: 'collage sports', value: 'collage sports' },
	{ label: 'premium channels', value: 'premium channels' },
];

export default function LiveTVPage() {
	const { t } = useTranslation();
	const [search, setSearch] = useState('');
	const [selectedChannel, setSelectedChannel] = useState(null);
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const category = searchParams.get('category') || '';
	console.log('LiveTVPage render, category:', category);

	const filteredChannels = channels.filter(ch => {
		const channelCategories = (ch.categories || []).map(cat => cat.trim().toLowerCase());
		const selected = category.trim().toLowerCase();
		if (selected === '') return true;
		// Only show channels that have the selected category and do NOT have any other main category
		// (main categories: news, sports, entertainment, movies, kids, music, lifestyle, local, international, comedy, adult, cultural, weather, health-fitness, documentary)
		const mainCategories = [
			'news','sports','entertainment','movies','kids','music','lifestyle','local','international','comedy','adult','cultural','weather','health-fitness','documentary'
		];
		// If the selected category is a main category, only show channels that have ONLY that main category (and possibly subcategories)
		if (mainCategories.includes(selected)) {
			// Remove all main categories except the selected one
			const otherMain = channelCategories.filter(cat => mainCategories.includes(cat) && cat !== selected);
			return channelCategories.includes(selected) && otherMain.length === 0;
		}
		// For non-main categories, just check inclusion
		return channelCategories.includes(selected);
	});

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main className="flex-1 py-4 mt-6">
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<h1 className="mb-4 text-3xl font-bold">{t('Live TV')}</h1>
						<div className="mb-6">
							<input
								type="text"
								placeholder={t('Search TV Channels...')}
								className="w-full rounded border bg-black p-2"
								name="search"
								value={search}
								onChange={e => setSearch(e.target.value)}
							/>
						</div>
					</div>
					<div className="mb-8 flex flex-wrap gap-2">
						{categories.map(cat => (
							<a
								key={cat.value}
								className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ${category === cat.value ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'} h-10 px-4 py-2`}
								href={`?category=${cat.value}`}
								onClick={e => {
									e.preventDefault();
									setSearchParams(cat.value ? { category: cat.value } : {});
									const main = document.querySelector('main');
									if (main) main.scrollIntoView({ behavior: 'smooth' });
								}}
							>
								{t(cat.label)}
							</a>
						))}
					</div>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-4 lg:grid-cols-4">
						{filteredChannels.length === 0 ? (
							<div className="text-center col-span-full text-muted-foreground">
								{t('No channels found.')}
							</div>
						) : (
							filteredChannels.map((channel, idx) => (
								<button
									key={channel.id + '-' + idx}
									className="flex min-h-[180px] flex-col items-center justify-center rounded-md border bg-gradient-to-r from-violet-200/10 to-indigo-400/15 p-4 shadow-lg transition-all duration-300 hover:border-[#4f46e5] hover:from-indigo-200/15 hover:to-violet-200/10 lg:min-h-[180px]"
									onClick={() => navigate(`/watch/channel/${channel.id}?name=${encodeURIComponent(channel.name)}`)}
								>
									{channel.logo ? (
										<img
											src={channel.logo}
											alt={channel.name}
											className="mb-2 h-12 w-auto object-contain"
										/>
									) : (
										<div className="mb-2 h-12 w-auto flex items-center justify-center text-gray-400">
											{t('No Logo')}
										</div>
									)}
									<h3 className="text-center text-sm font-semibold text-gray-500">
										{channel.name}
									</h3>
									{channel.categories && channel.categories.length > 0 && (
										<div className="mt-2 text-center text-xs text-gray-400">
											{channel.categories.map((cat, idx) => (
												<div
													key={idx}
													className="inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 ml-2 bg-gray-50 px-1 py-0 text-[9px] leading-normal tracking-wide text-gray-900"
												>
													{t(cat)}
												</div>
											))}
										</div>
									)}
								</button>
							))
						)}
					</div>
					{selectedChannel && (
						<div className="mt-8">
							<h2 className="mb-4 text-xl font-bold">
								{t('Now Playing:')} {selectedChannel.name}
							</h2>
							<div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
								<iframe
									src={selectedChannel.streamUrl}
									allowFullScreen
									width="100%"
									height="100%"
									className="w-full h-full min-h-[360px]"
									title={selectedChannel.name}
								/>
							</div>
							<button
								className="mt-4 px-4 py-2 rounded bg-gray-700 text-white"
								onClick={() => setSelectedChannel(null)}
							>
								{t('Close Player')}
							</button>
						</div>
					)}
				</div>
			</main>
			<Footer />
		</div>
	);
}
