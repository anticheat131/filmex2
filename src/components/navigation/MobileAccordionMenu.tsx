import * as React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@radix-ui/react-accordion';
import { Link } from 'react-router-dom';
import { Home, Film, Tv, TrendingUp, History, UserCircle, LogIn, UserPlus, ChevronDown, ListCollapse, Antenna } from 'lucide-react';

const menu = [
	{
		title: 'Movies',
		icon: (
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
				className="lucide lucide-clapperboard mr-2 size-4"
			>
				<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"></path>
				<path d="m6.2 5.3 3.1 3.9"></path>
				<path d="m12.4 3.4 3.1 4"></path>
				<path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path>
			</svg>
		),
		children: [
			{
				title: 'Discover',
				path: '/movie/discover',
				icon: (
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
						className="lucide lucide-telescope mr-2 size-4"
					>
						<path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"></path>
						<path d="m13.56 11.747 4.332-.924"></path>
						<path d="m16 21-3.105-6.21"></path>
						<path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"></path>
						<path d="m6.158 8.633 1.114 4.456"></path>
						<path d="m8 21 3.105-6.21"></path>
						<circle cx="12" cy="13" r="2"></circle>
					</svg>
				),
			},
			{
				title: 'Popular',
				path: '/movie/popular',
				icon: (
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
						className="lucide lucide-heart mr-2 size-4"
					>
						<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
					</svg>
				),
			},
			{
				title: 'Now Playing',
				path: '/movie/now-playing',
				icon: (
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
						className="lucide lucide-play mr-2 size-4"
					>
						<polygon points="6 3 20 12 6 21 6 3"></polygon>
					</svg>
				),
			},
			{
				title: 'Upcoming',
				path: '/movie/upcoming',
				icon: (
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
						className="lucide lucide-calendar mr-2 size-4"
					>
						<path d="M8 2v4"></path>
						<path d="M16 2v4"></path>
						<rect width="18" height="18" x="3" y="4" rx="2"></rect>
						<path d="M3 10h18"></path>
					</svg>
				),
			},
			{
				title: 'Top Rated',
				path: '/movie/top-rated',
				icon: (
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
						className="lucide lucide-star mr-2 size-4"
					>
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
					</svg>
				),
			},
			{
				title: 'Anime movies',
				path: '/movie/anime-movies?with_watch_providers=283%7C1968&sort_by=primary_release_date.desc',
				icon: (
					<svg
						stroke="currentColor"
						fill="currentColor"
						strokeWidth="0"
						role="img"
						viewBox="0 0 24 24"
						className="mr-2 size-4"
						height="1em"
						width="1em"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M2.933 13.467a10.55 10.55 0 1 1 21.067-.8V12c0-6.627-5.373-12-12-12S0 5.373 0 12s5.373 12 12 12h.8a10.617 10.617 0 0 1-9.867-10.533zM19.2 14a3.85 3.85 0 0 1-1.333-7.467A7.89 7.89 0 0 0 14 5.6a8.4 8.4 0 1 0 8.4 8.4 6.492 6.492 0 0 0-.133-1.6A3.415 3.415 0 0 1 19.2 14z"></path>
					</svg>
				),
			},
		],
	},
	{
		title: 'Shows',
		icon: (
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
				className="lucide lucide-tv mr-2 size-4"
			>
				<rect width="20" height="15" x="2" y="7" rx="2" ry="2"></rect>
				<polyline points="17 2 12 7 7 2"></polyline>
			</svg>
		),
		children: [
			{
				title: 'Discover',
				path: '/tv/discover',
				icon: (
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
						className="lucide lucide-telescope mr-2 size-4"
					>
						<path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"></path>
						<path d="m13.56 11.747 4.332-.924"></path>
						<path d="m16 21-3.105-6.21"></path>
						<path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"></path>
						<path d="m6.158 8.633 1.114 4.456"></path>
						<path d="m8 21 3.105-6.21"></path>
						<circle cx="12" cy="13" r="2"></circle>
					</svg>
				),
			},
			{
				title: 'Popular',
				path: '/tv/popular',
				icon: (
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
						className="lucide lucide-heart mr-2 size-4"
					>
						<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
					</svg>
				),
			},
			{
				title: 'Airing Today',
				path: '/tv/airing-today',
				icon: (
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
						className="lucide lucide-play mr-2 size-4"
					>
						<polygon points="6 3 20 12 6 21 6 3"></polygon>
					</svg>
				),
			},
			{
				title: 'On The Air',
				path: '/tv/on-the-air',
				icon: (
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
						className="lucide lucide-radio-tower mr-2 size-4"
					>
						<path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9"></path>
						<path d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5"></path>
						<circle cx="12" cy="9" r="2"></circle>
						<path d="M16.2 4.8c2 2 2.26 5.11.8 7.47"></path>
						<path d="M19.1 1.9a9.96 9.96 0 0 1 0 14.1"></path>
						<path d="M9.5 18h5"></path>
						<path d="m8 22 4-11 4 11"></path>
					</svg>
				),
			},
			{
				title: 'Top Rated',
				path: '/tv/top-rated',
				icon: (
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
						className="lucide lucide-star mr-2 size-4"
					>
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
					</svg>
				),
			},
			{
				title: 'Anime TV Shows',
				path: '/tv/anime-series?with_watch_providers=283%7C1968c',
				icon: (
					<svg
						stroke="currentColor"
						fill="currentColor"
						strokeWidth="0"
						role="img"
						viewBox="0 0 24 24"
						className="mr-2 size-4"
						height="1em"
						width="1em"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M2.933 13.467a10.55 10.55 0 1 1 21.067-.8V12c0-6.627-5.373-12-12-12S0 5.373 0 12s5.373 12 12 12h.8a10.617 10.617 0 0 1-9.867-10.533zM19.2 14a3.85 3.85 0 0 1-1.333-7.467A7.89 7.89 0 0 0 14 5.6a8.4 8.4 0 1 0 8.4 8.4 6.492 6.492 0 0 0-.133-1.6A3.415 3.415 0 0 1 19.2 14z"></path>
					</svg>
				),
			},
		],
	},
	{
		title: 'Trending',
		icon: (
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
				className="lucide lucide-trending-up mr-2 size-4"
			>
				<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
				<polyline points="16 7 22 7 22 13"></polyline>
			</svg>
		),
		children: [
			{
				title: 'Movies',
				path: '/trending/movie',
				icon: (
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
						className="lucide lucide-clapperboard mr-2 size-4"
					>
						<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"></path>
						<path d="m6.2 5.3 3.1 3.9"></path>
						<path d="m12.4 3.4 3.1 4"></path>
						<path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path>
					</svg>
				),
			},
			{
				title: 'Shows',
				path: '/trending/tv',
				icon: (
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
						className="lucide lucide-tv mr-2 size-4"
					>
						<rect width="20" height="15" x="2" y="7" rx="2" ry="2"></rect>
						<polyline points="17 2 12 7 7 2"></polyline>
					</svg>
				),
			},
		],
	},
	{
		title: 'More',
		icon: (
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
				className="lucide lucide-list-collapse mr-2 size-4"
			>
				<path d="m3 10 2.5-2.5L3 5"></path>
				<path d="m3 19 2.5-2.5L3 14"></path>
				<path d="M10 6h11"></path>
				<path d="M10 12h11"></path>
				<path d="M10 18h11"></path>
			</svg>
		),
		children: [
			{
				title: 'Popular Persons',
				path: '/person/popular',
				icon: (
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
						className="lucide lucide-heart mr-2 size-4"
					>
						<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
					</svg>
				),
			},
			{
				title: 'Latest News',
				path: '/news',
				icon: (
					<svg
						stroke="currentColor"
						fill="none"
						strokeWidth="1.5"
						viewBox="0 0 24 24"
						aria-hidden="true"
						className="mr-2 size-4"
						height="1em"
						width="1em"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
						></path>
					</svg>
				),
			},
		],
	},
	{
		title: 'Contents',
		path: '/4k-contents',
		icon: (
			<svg
				stroke="currentColor"
				fill="currentColor"
				strokeWidth="0"
				viewBox="0 0 16 16"
				className="mr-2 size-4"
				height="1em"
				width="1em"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M3.577 8.9v.03h1.828V5.898h-.062a47 47 0 0 0-1.766 3.001z"></path>
				<path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm2.372 3.715.435-.714h1.71v3.93h.733v.957h-.733V11H5.405V9.888H2.5v-.971c.574-1.077 1.225-2.142 1.872-3.202m7.73-.714h1.306l-2.14 2.584L13.5 11h-1.428l-1.679-2.624-.615.7V11H8.59V5.001h1.187v2.686h.057L12.102 5z"></path>
			</svg>
		),
	},
	{
		title: 'TV',
		icon: <Antenna className="mr-2 size-4" />,
		path: '/live-tv',
	},
	{
		title: 'Audible',
		icon: (
			<svg
				stroke="currentColor"
				fill="currentColor"
				strokeWidth="0"
				viewBox="0 0 640 512"
				className="mr-2 size-4"
				height="1em"
				width="1em"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M640 199.9v54l-320 200L0 254v-54l320 200 320-200.1zm-194.5 72l47.1-29.4c-37.2-55.8-100.7-92.6-172.7-92.6-72 0-135.5 36.7-172.6 92.4h.3c2.5-2.3 5.1-4.5 7.7-6.7 89.7-74.4 219.4-58.1 290.2 36.3zm-220.1 18.8c16.9-11.9 36.5-18.7 57.4-18.7 34.4 0 65.2 18.4 86.4 47.6l45.4-28.4c-20.9-29.9-55.6-49.5-94.8-49.5-38.9 0-73.4 19.4-94.4 49zM103.6 161.1c131.8-104.3 318.2-76.4 417.5 62.1l.7 1 48.8-30.4C517.1 112.1 424.8 58.1 319.9 58.1c-103.5 0-196.6 53.5-250.5 135.6 9.9-10.5 22.7-23.5 34.2-32.6zm467 32.7z"></path>
			</svg>
		),
		path: '/audiobooks',
	},
];

const MobileAccordionMenu = () => {
	return (
		<div
			className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col border bg-background"
			style={{
				pointerEvents: 'auto',
				transition: 'none',
				transform: 'translate3d(0px, 0px, 0px)',
			}}
		>
			<div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted"></div>
			<div className="grid gap-1.5 p-4 text-center sm:text-left">
				<h2 className="text-lg font-semibold leading-none tracking-tight">
					Menu
				</h2>
			</div>
			<Accordion type="multiple" className="px-2" collapsible>
				{menu.map((item, idx) =>
					item.children ? (
						<AccordionItem
							key={item.title}
							value={item.title}
							className="border-b-0"
						>
							<AccordionTrigger className="flex-1 [&[data-state=open]>svg]:rotate-180 inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full justify-between hover:no-underline">
								<div className="flex items-center justify-start">
									{item.icon}
									{item.title}
								</div>
								<ChevronDown className="size-4 shrink-0 transition-transform duration-200" />
							</AccordionTrigger>
							<AccordionContent className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
								<div className="flex flex-col gap-1 py-2">
									{item.children.map((child) => (
										<Link
											key={child.path}
											to={child.path}
											className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full justify-between hover:no-underline"
										>
											<div className="flex items-center justify-start">
												{child.icon}
												{child.title}
											</div>
										</Link>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
					) : (
						<Link
							key={item.title}
							to={item.path!}
							className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full justify-between hover:no-underline"
						>
							<div className="flex items-center justify-start">
								{item.icon}
								{item.title}
							</div>
						</Link>
					)
				)}
			</Accordion>
			<div className="shrink-0 bg-border h-px w-full mt-4" />
		</div>
	);
};

export default MobileAccordionMenu;
