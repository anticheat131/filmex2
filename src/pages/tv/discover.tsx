import React, { useEffect, useState } from 'react';
import { tmdb } from '@/utils/services/tmdb';
import MediaGrid from '@/components/MediaGrid';
import { ensureExtendedMediaArray, Media } from '@/utils/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import * as Select from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useTranslation } from 'react-i18next';

const TV_GENRES = [
	{ id: 10759, name: 'Action & Adventure' },
	{ id: 16, name: 'Animation' },
	{ id: 35, name: 'Comedy' },
	{ id: 80, name: 'Crime' },
	{ id: 99, name: 'Documentary' },
	{ id: 18, name: 'Drama' },
	{ id: 10751, name: 'Family' },
	{ id: 10762, name: 'Kids' },
	{ id: 9648, name: 'Mystery' },
	{ id: 10763, name: 'News' },
	{ id: 10764, name: 'Reality' },
	{ id: 10765, name: 'Sci-Fi & Fantasy' },
	{ id: 10766, name: 'Soap' },
	{ id: 10767, name: 'Talk' },
	{ id: 10768, name: 'War & Politics' },
	{ id: 37, name: 'Western' },
];

const TV_LANGUAGES = [
	{ code: 'en', name: 'English' },
	{ code: 'es', name: 'Spanish' },
	{ code: 'fr', name: 'French' },
	{ code: 'de', name: 'German' },
	{ code: 'it', name: 'Italian' },
	{ code: 'ja', name: 'Japanese' },
	{ code: 'ko', name: 'Korean' },
	{ code: 'zh', name: 'Chinese' },
	{ code: 'ru', name: 'Russian' },
	{ code: 'hi', name: 'Hindi' },
	{ code: 'pt', name: 'Portuguese' },
	{ code: 'ar', name: 'Arabic' },
	{ code: 'tr', name: 'Turkish' },
	{ code: 'pl', name: 'Polish' },
	{ code: 'sv', name: 'Swedish' },
	{ code: 'nl', name: 'Dutch' },
	{ code: 'da', name: 'Danish' },
	{ code: 'fi', name: 'Finnish' },
	{ code: 'no', name: 'Norwegian' },
	{ code: 'th', name: 'Thai' },
];

const TV_PROVIDERS = [
	{ id: 8, name: 'Netflix' },
	{ id: 9, name: 'Amazon Prime Video' },
	{ id: 337, name: 'Disney Plus' },
	{ id: 15, name: 'Hulu' },
	{ id: 384, name: 'HBO Max' },
	{ id: 350, name: 'Apple TV Plus' },
	{ id: 531, name: 'Paramount Plus' },
	{ id: 386, name: 'Peacock' },
	{ id: 283, name: 'YouTube' },
	{ id: 2, name: 'Apple iTunes' },
];

export default function TVDiscover() {
	const { t } = useTranslation();

	// Add missing state for page and totalPages
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	// Add all other required state variables
	const [loading, setLoading] = useState(false);
	const [shows, setShows] = useState<Media[]>([]);
	const [sortBy, setSortBy] = useState('popularity.desc');
	const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
	const [fromYear, setFromYear] = useState<number | null>(null);
	const [toYear, setToYear] = useState<number | null>(null);
	const [language, setLanguage] = useState('');
	const [provider, setProvider] = useState<number | null>(null);
	const [voteAverage, setVoteAverage] = useState(0);
	const [minVotes, setMinVotes] = useState(0);
	const [filterOpen, setFilterOpen] = useState(false);

	// Add clearFilters function
	const clearFilters = () => {
		setSelectedGenres([]);
		setFromYear(null);
		setToYear(null);
		setLanguage('');
		setProvider(null);
		setVoteAverage(0);
		setMinVotes(0);
		setPage(1);
	};

	const SORT_OPTIONS = [
		{ value: 'popularity.desc', label: t('Highest Popularity'), icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up mr-2 size-4"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
		), chevron: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down size-4"><path d="m6 9 6 6 6-6"></path></svg>
		)},
		{ value: 'popularity.asc', label: t('Lowest Popularity'), icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-down mr-2 size-4"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
		), chevron: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up size-4"><path d="m18 15-6-6-6 6"></path></svg>
		)},
		{ value: 'first_air_date.desc', label: t('Most Recent'), icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-arrow-up mr-2 size-4"><path d="m14 18 4-4 4 4"></path><path d="M16 2v4"></path><path d="M18 22v-8"></path><path d="M21 11.343V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9"></path><path d="M3 10h18"></path><path d="M8 2v4"></path></svg>
		), chevron: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down size-4"><path d="m6 9 6 6 6-6"></path></svg>
		)},
		{ value: 'first_air_date.asc', label: t('Least Recent'), icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-arrow-down mr-2 size-4"><path d="m14 18 4 4 4-4"></path><path d="M16 2v4"></path><path d="M18 14v8"></path><path d="M21 11.354V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.343"></path><path d="M3 10h18"></path><path d="M8 2v4"></path></svg>
		), chevron: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up size-4"><path d="m18 15-6-6-6 6"></path></svg>
		)},
		{ value: 'vote_average.desc', label: t('Highest Rating'), icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-up mr-2 size-4"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"></path></svg>
		), chevron: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down size-4"><path d="m6 9 6 6 6-6"></path></svg>
		)},
		{ value: 'vote_average.asc', label: t('Lowest Rating'), icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-down mr-2 size-4"><path d="M17 14V2"></path><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"></path></svg>
		), chevron: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up size-4"><path d="m18 15-6-6-6 6"></path></svg>
		)},
		{ value: 'vote_count.desc', label: t('Most Voted'), icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-plus mr-2 size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
		), chevron: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down size-4"><path d="m6 9 6 6 6-6"></path></svg>
		)},
		{ value: 'vote_count.asc', label: t('Least Voted'), icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-minus mr-2 size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="22" x2="16" y1="11" y2="11"></line></svg>
		), chevron: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up size-4"><path d="m18 15-6-6-6 6"></path></svg>
		)},
	];

const currentYear = new Date().getFullYear();

	useEffect(() => {
		async function fetchTVShows() {
			setLoading(true);
			const params: any = {
				page,
				sort_by: sortBy,
				with_genres: selectedGenres.length ? selectedGenres.join(',') : undefined,
				'first_air_date.gte': fromYear ? `${fromYear}-01-01` : undefined,
				'first_air_date.lte': toYear ? `${toYear}-12-31` : undefined,
				with_original_language: language || undefined,
				with_watch_providers: provider ? provider.toString() : undefined,
				vote_average_gte: voteAverage > 0 ? voteAverage : undefined,
				vote_count_gte: minVotes > 0 ? minVotes : undefined,
				watch_region: provider ? 'US' : undefined,
			};
			const { data } = await tmdb.get('/discover/tv', { params });
			setShows(data.results);
			setTotalPages(data.total_pages);
			setLoading(false);
		}
		fetchTVShows();
	}, [page, sortBy, selectedGenres, fromYear, toYear, language, provider, voteAverage, minVotes]);

	const handleGenreToggle = (id: number) => {
		setSelectedGenres((prev) =>
			prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
		);
	};

	const handleApplyFilters = () => {
		setPage(1);
		setFilterOpen(false);
	};

	const yearOptions = Array.from({ length: 80 }, (_, i) => currentYear - i);

	return (
		<>
			<Navbar />
			<main className="flex flex-col min-h-screen pt-20">
				<div className="main-container mx-auto px-4 py-8 w-full flex-1">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
						<div className="text-left">
							<h1 className="text-3xl md:text-4xl font-bold text-white text-left">
								{t('Discover TV Shows')}
							</h1>
							<p className="text-gray-300 mt-1 text-base max-w-2xl text-left">
								{t('Find TV shows by genre, rating, year, and more. Use the filters and sorting options to explore TMDB’s vast TV show collection.')}
							</p>
						</div>
						<div className="flex gap-2 items-center">
							<Sheet open={filterOpen} onOpenChange={setFilterOpen}>
								<SheetTrigger asChild>
									<button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="lucide lucide-sliders-horizontal mr-2 size-4"
										>
											<line x1="21" x2="14" y1="4" y2="4"></line>
											<line x1="10" x2="3" y1="4" y2="4"></line>
											<line x1="21" x2="12" y1="12" y2="12"></line>
											<line x1="8" x2="3" y1="12" y2="12"></line>
											<line x1="21" x2="16" y1="20" y2="20"></line>
											<line x1="12" x2="3" y1="20" y2="20"></line>
											<line x1="14" x2="14" y1="2" y2="6"></line>
											<line x1="8" x2="8" y1="10" y2="14"></line>
											<line x1="16" x2="16" y1="18" y2="22"></line>
										</svg>
										{t('Filters')}
									</button>
								</SheetTrigger>
								<SheetContent
									side="right"
									className="fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm flex flex-col px-0"
								>
									<div className="flex-1 min-h-0 overflow-y-auto overscroll-contain hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
										<div className="flex flex-col space-y-2 text-center sm:text-left px-4 md:px-6">
											<h2 className="text-lg font-semibold text-foreground">
												{t('Filters')}
											</h2>
											<p className="text-sm text-muted-foreground">
												{t('Narrow down your search results with the following filters.')}
											</p>
										</div>
										<div
											className="relative overflow-hidden px-4 md:px-6"
											style={{ position: 'relative' }}
										>
											<div className="space-y-8">
												{/* Genres */}
												<div className="space-y-2">
													<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground">
														{t('Genres')}
													</label>
													<div className="flex flex-wrap gap-2">
														{TV_GENRES.map((genre) => (
															<button
																key={genre.id}
																className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${
																	selectedGenres.includes(genre.id)
																		? 'bg-primary text-primary-foreground hover:bg-primary/80'
																		: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
																}`}
																onClick={() => handleGenreToggle(genre.id)}
																type="button"
															>
																{t(genre.name)}
															</button>
														))}
													</div>
												</div>
												{/* Date pickers */}
												<div className="grid gap-2 md:grid-cols-2">
													<div className="space-y-2">
														<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex text-muted-foreground">
															{t('From')}
														</label>
														<select
															className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full justify-start text-left font-normal text-muted-foreground"
															value={fromYear || ''}
															onChange={(e) =>
																setFromYear(
																	e.target.value ? Number(e.target.value) : null
																)
															}
														>
															<option value="">{t('Select date...')}</option>
															{yearOptions.map((y) => (
																<option key={y} value={y}>
																	{y}
																</option>
															))}
														</select>
													</div>
													<div className="space-y-2">
														<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex text-muted-foreground">
															{t('To')}
														</label>
														<select
															className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full justify-start text-left font-normal text-muted-foreground"
															value={toYear || ''}
															onChange={(e) =>
																setToYear(
																	e.target.value ? Number(e.target.value) : null
																)
															}
														>
															<option value="">{t('Select date...')}</option>
															{yearOptions.map((y) => (
																<option key={y} value={y}>
																	{y}
																</option>
															))}
														</select>
													</div>
												</div>
												{/* Language */}
												<div className="space-y-2">
													<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex text-muted-foreground">
														{t('Language')}
													</label>
													<select
														className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-muted-foreground w-full justify-between text-left"
														value={language}
														onChange={(e) => setLanguage(e.target.value)}
													>
														<option value="">{t('Select language...')}</option>
														{TV_LANGUAGES.map((l) => (
															<option key={l.code} value={l.code}>
																{l.name}
															</option>
														))}
													</select>
												</div>
												{/* Provider */}
												<div className="space-y-2">
													<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 text-muted-foreground">
														{t('Where to watch')}
														<button
															data-state="closed"
															tabIndex={-1}
															className="ml-1"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="24"
																height="24"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
																className="lucide lucide-info size-4"
															>
																<circle cx="12" cy="12" r="10"></circle>
																<path d="M12 16v-4"></path>
																<path d="M12 8h.01"></path>
															</svg>
														</button>
													</label>
													<select
														className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-muted-foreground w-full justify-between text-left"
														value={provider || ''}
														onChange={(e) =>
															setProvider(
																e.target.value ? Number(e.target.value) : null
															)
														}
													>
														<option value="">{t('Select providers...')}</option>
														{TV_PROVIDERS.map((p) => (
															<option key={p.id} value={p.id}>
																{p.name}
															</option>
														))}
													</select>
												</div>
												{/* Vote Average */}
												<div className="space-y-4">
													<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground">
														{t('Vote Average')}
													</label>
													<Slider
														min={0}
														max={10}
														step={0.1}
														value={[voteAverage]}
														onValueChange={([v]) => setVoteAverage(v)}
													/>
													<div className="mt-4 flex justify-between border-t">
														{[...Array(11)].map((_, i) => (
															<div className="relative pt-2" key={i}>
																<span className="text-[9px] text-muted-foreground">
																	{i}
																</span>
																<span className="absolute left-1/2 top-0 block h-1/3 w-px -translate-x-px bg-muted"></span>
															</div>
														))}
													</div>
												</div>
												{/* Minimum Votes */}
												<div className="space-y-4">
													<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground">
														{t('Minimum Votes')}
													</label>
													<Slider
														min={0}
														max={500}
														step={10}
														value={[minVotes]}
														onValueChange={([v]) => setMinVotes(v)}
													/>
													<div className="mt-4 flex justify-between border-t">
														{[
															0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500,
														].map((v) => (
															<div className="relative pt-2" key={v}>
																<span className="text-[9px] text-muted-foreground">
																	{v}
																</span>
																<span className="absolute left-1/2 top-0 block h-1/3 w-px -translate-x-px bg-muted"></span>
															</div>
														))}
													</div>
												</div>
											</div>
										</div>
										<div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 px-4 md:gap-0 md:px-6 mt-6">
											<button
												className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8"
												onClick={clearFilters}
												type="button"
											>
												{t('Clear')}
											</button>
											<SheetClose asChild>
												<button
													type="button"
													className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
													onClick={handleApplyFilters}
												>
													{t('Save Changes')}
												</button>
											</SheetClose>
										</div>
										<button
											type="button"
											className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-secondary"
											onClick={() => setFilterOpen(false)}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="24"
												height="24"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="lucide lucide-x size-4"
											>
												<path d="M18 6 6 18"></path>
												<path d="m6 6 12 12"></path>
											</svg>
											<span className="sr-only">{t('Close')}</span>
										</button>
									</div>
								</SheetContent>
							</Sheet>
							{/* Sort by popover button */}
							<Popover>
								<PopoverTrigger asChild>
									<button
										type="button"
										aria-haspopup="dialog"
										aria-expanded="false"
										aria-controls="sortby-dropdown"
										data-state="closed"
										className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="lucide lucide-arrow-down-wide-narrow mr-2 size-4"
										>
											<path d="m3 16 4 4 4-4"></path>
											<path d="M7 20V4"></path>
											<path d="M11 4h10"></path>
											<path d="M11 8h7"></path>
											<path d="M11 12h4"></path>
										</svg>
										{t('Sort by')}
									</button>
								</PopoverTrigger>
								<PopoverContent
									align="end"
									side="top"
									className="z-50 w-72 rounded-md border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 flex flex-col gap-1 p-1"
								>
									{SORT_OPTIONS.map(opt => (
										<button
											key={opt.value}
											className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ${
												sortBy === opt.value
													? 'bg-primary text-primary-foreground hover:bg-primary/90'
													: 'hover:bg-accent hover:text-accent-foreground'
											} h-10 px-4 py-2 justify-between text-left font-normal`}
											onClick={() => {
												setSortBy(opt.value);
												setPage(1);
											}}
										>
											<span className="flex items-center">{opt.icon} {opt.label}</span>
											{opt.chevron}
										</button>
									))}
								</PopoverContent>
							</Popover>
						</div>
					</div>
					<div>
						{loading ? (
							<div className="text-white text-center py-12">
								{t('Loading TV shows...')}
							</div>
						) : (
							<MediaGrid media={ensureExtendedMediaArray(shows)} title="" />
						)}
					</div>
					{/* Pagination controls */}
					<div className="flex justify-center mt-10">
						<button
							className="px-3 py-2 mx-1 rounded bg-gray-800 text-white disabled:opacity-50"
							onClick={() => setPage(page - 1)}
							disabled={page === 1}
						>
							{t('Previous')}
						</button>
						<span className="px-4 py-2 text-white">
							{t('Page {{page}} of {{totalPages}}', { page, totalPages })}
						</span>
						<button
							className="px-3 py-2 mx-1 rounded bg-gray-800 text-white disabled:opacity-50"
							onClick={() => setPage(page + 1)}
							disabled={page === totalPages}
						>
							{t('Next')}
						</button>
					</div>
				</div>
				<Footer />
			</main>
		</>
	);
}
