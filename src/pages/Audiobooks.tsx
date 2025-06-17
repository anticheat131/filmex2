import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import audiobooks from '@/data/audiobooks.json';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const allCategories = [
	'All',
	'Action',
	'Adventure',
	'Adults',
	'Atheism',
	'Audiobooks',
	'Autobiography',
	'Autobiography & Biographies',
	'Biography & Autobiography',
	'Body, Mind & Spirit',
	'Bestsellers',
	'Business',
	'Business & Economics',
	'Children',
	'Classic',
	'Comics',
	'Comics & Graphic Novels',
	'Crime',
	'Dysfunctional families',
	'Electronic books',
	'Fantasy',
	'Fiction',
	'General Fiction',
	'Historical Fiction',
	'History',
	'Horror',
	'Humor',
	'Insurgency',
	'Interstellar travel',
	'Juvenile Fiction',
	'Literature & Fiction',
	'Magic',
	'Motion pictures',
	'Mystery',
	'Nature',
	'Novel',
	'Political Science',
	'Psychology',
	'Religion',
	'Romance',
	'Science',
	'Science Fiction',
	'Self-help',
	'Spiritual & Religious',
	'Sports',
	'Sports & Recreation',
	'Suspense',
	'Teen & Young Adult',
	'Thriller',
	'Urban Fantasy',
	'Young Adult Fiction',
];

export default function AudiobooksPage() {
	const { t } = useTranslation();
	const [search, setSearch] = useState('');
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const category = searchParams.get('category') || 'All';

	const filteredBooks = audiobooks.filter((book) => {
		const matchesSearch =
			!search ||
			book.title.toLowerCase().includes(search.toLowerCase()) ||
			book.author.toLowerCase().includes(search.toLowerCase());
		const matchesCategory =
			category === 'All' ||
			(book.categories &&
				book.categories.some((cat) => cat.toLowerCase() === category.toLowerCase()));
		return matchesSearch && matchesCategory;
	});

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main className="relative flex-1 py-4 mt-6">
				<div className="container space-y-8">
					<div className="m-auto main-container text-muted-foreground">
						<div className="mb-6 flex items-center">
							<input
								type="text"
								placeholder={t('Search Audible Audiobooks...')}
								className="w-full rounded border p-3 text-sm"
								name="search"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
					</div>
					<div className="scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 m-auto flex max-h-[300px] main-container flex-wrap gap-2 overflow-y-auto">
						{allCategories.map((cat) => (
							<a
								key={cat}
								className={`rounded-md border px-3 py-2 text-center text-xs font-medium ${
									category === cat ? 'bg-[#43437b] text-white' : 'bg-accent'
								}`}
								href={cat === 'All' ? '/audiobooks' : `/audiobooks?category=${encodeURIComponent(cat)}`}
								onClick={(e) => {
									e.preventDefault();
									setSearchParams(cat === 'All' ? {} : { category: cat });
								}}
							>
								{t(cat)}
							</a>
						))}
					</div>
					<div className="m-auto grid main-container grid-cols-2 gap-6 md:grid-cols-3 md:gap-12 lg:grid-cols-5">
						{filteredBooks.map((book) => (
							<a
								key={book.id}
								className="audiobook_audiobook-card__link__Gm3lN flex max-h-[300px] overflow-hidden rounded-lg md:max-h-[320px]"
								href={`/listen/${book.id}/${encodeURIComponent(book.title.replace(/\s+/g, '+'))}`}
								onClick={(e) => {
									e.preventDefault();
									navigate(
										`/listen/${book.id}/${encodeURIComponent(book.title.replace(/\s+/g, '+'))}`
									);
								}}
							>
								<div className="audiobook_audiobook-card__IwSM4 border-gray relative flex w-full overflow-hidden rounded-lg border bg-[#222121] transition-shadow duration-300 hover:shadow-lg hover:shadow-black">
									<img
										alt={book.title}
										className="max-h-[300px] w-full object-cover transition-all duration-300 md:max-h-[320px]"
										src={book.cover}
									/>
									<div
										className="absolute w-full rounded-b-md bg-gradient-to-t from-[#0b0b0b] to-transparent p-4 transition-all duration-300"
										style={{ bottom: '-100px' }}
									>
										<p
											className="text-[18px] font-semibold leading-[21px] text-white"
											style={{
												textShadow: 'rgba(0, 0, 0, 0.5) 1px 1px 2px',
											}}
										>
											{book.title}
										</p>
										<p className="mt-2 text-sm text-gray-400">
											{book.author}
										</p>
									</div>
								</div>
							</a>
						))}
					</div>
					<div className="flex flex-col items-center gap-4 py-4">
						<div>
							<button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-48">
								{t('Load More')}
							</button>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
