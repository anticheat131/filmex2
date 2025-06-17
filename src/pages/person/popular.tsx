import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { tmdb, getImageUrl } from "../../utils/services/tmdb";
import { useTranslation } from "react-i18next";

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

const CARDS_PER_PAGE = 20;

export default function PopularPeoplePage() {
	const { t } = useTranslation();
	const query = useQuery();
	const navigate = useNavigate();
	const page = parseInt(query.get("page") || "1", 10);
	const [people, setPeople] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const [totalResults, setTotalResults] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		// TMDB returns 20 per page, so fetch two pages if needed
		const fetchPages = async () => {
			const mainPage = await tmdb.get("/person/popular", { params: { page } });
			let results = mainPage.data.results;
			setPeople(results);
			setTotalPages(Math.ceil(mainPage.data.total_results / CARDS_PER_PAGE));
			setTotalResults(mainPage.data.total_results);
			setLoading(false);
		};
		fetchPages();
	}, [page]);

	const handlePageChange = (newPage: number) => {
		navigate(`/person/popular?page=${newPage}`);
	};

	return (
		<>
			<Navbar />
			<div className="relative flex-1 py-4 mt-16">
				<div className="container space-y-8">
					<div className="md:mb-24 md:mt-12 text-left">
						<h1 className="mb-2 text-2xl font-medium text-left">{t('Popular People')}</h1>
						<p className="max-w-3xl text-muted-foreground text-left">
							{t('Explore the most popular people in the entertainment industry. From award-winning actors to visionary directors, discover the faces behind your favorite movies and TV shows.')}
						</p>
					</div>
					{loading ? (
						<div className="text-center py-12">{t('Loading…')}</div>
					) : (
						<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
							{people.map((person: any) => (
								<Link className="w-full" to={`/person/${person.id}`} key={person.id}>
									<div className="relative aspect-[2/3] rounded-md overflow-hidden border bg-muted">
										<img
											alt={person.name}
											loading="lazy"
											decoding="async"
											className="size-full object-cover"
											style={{position:'absolute',height:'100%',width:'100%',left:0,top:0,right:0,bottom:0,color:'transparent'}}
											src={getImageUrl(person.profile_path, "w500") || "/placeholder.svg"}
										/>
										<div className="absolute bottom-0 left-0 w-full overlay bg-gradient-to-t from-black/80 via-black/40 to-transparent">
											<div className="p-2 md:p-4">
												<h2 className="line-clamp-1 text-sm font-medium md:text-lg mt-2 text-white">{person.name}</h2>
												<p className="line-clamp-3 text-xs text-muted-foreground md:text-base text-white/80 text-left">{t('Known for')} {t(person.known_for_department)}</p>
											</div>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
					{/* Pagination nav */}
					<nav role="navigation" aria-label="pagination" className="mx-auto flex w-full justify-center mt-8">
						<ul className="flex flex-row items-center gap-1">
							{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
								const p = i + 1;
								return (
									<li key={p}>
										<button
											className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 ${p === page ? "bg-accent text-accent-foreground" : ""}`}
											aria-current={p === page ? "page" : undefined}
											onClick={() => handlePageChange(p)}
										>
											{p}
										</button>
									</li>
								);
							})}
							{totalPages > 5 && (
								<span aria-hidden="true" className="size-9 items-center justify-center hidden md:flex">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis size-4"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
									<span className="sr-only">{t('More pages')}</span>
								</span>
							)}
							{page < totalPages && (
								<li className="flex items-center">
									<button
										className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pr-2.5 hidden md:flex"
										aria-label={t('Go to next page')}
										rel="next"
										onClick={() => handlePageChange(page + 1)}
									>
										<span>{t('Next')}</span>
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right size-4"><path d="m9 18 6-6-6-6"></path></svg>
									</button>
									<span className="ml-2 text-xs text-muted-foreground">{t('{{count}} actors', { count: totalResults })}</span>
								</li>
							)}
						</ul>
					</nav>
				</div>
			</div>
			<Footer />
		</>
	);
}
