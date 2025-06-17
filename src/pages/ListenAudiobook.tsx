import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import audiobooks from '@/data/audiobooks.json';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomAudioPlayer from '@/components/CustomAudioPlayer';

export default function ListenAudiobookPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const book = audiobooks.find(b => b.id === id);

  if (!book) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-xl">{t('Audiobook not found.')}</div>
        </main>
        <Footer />
      </div>
    );
  }

  // SEO Schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Audiobook',
    name: book.title,
    image: book.cover,
    author: { '@type': 'Person', name: book.author },
    inLanguage: 'English',
    duration: 'PT6H',
    bookFormat: 'https://schema.org/EBook',
    about: book.about,
    offers: {
      '@type': 'Offer',
      url: window.location.href,
      priceCurrency: 'USD',
      price: '0.00',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="relative flex-1 py-4 mt-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <div className="container ">
          <div className="details flex-1">
            <div className="mt-4 flex flex-col space-y-4 md:mt-8 md:flex-row md:space-x-8 md:space-y-0 md:px-16 xl:mt-12 xl:px-32">
              <img
                alt={book.title}
                className="audiobook_audiobookImage___Oz8Y max-h-fit w-full rounded-md object-cover sm:max-w-[200px] lg:max-w-[300px]"
                src={book.cover}
              />
              <div>
                <h1 className="mt-4 text-2xl font-bold md:text-5xl">
                  {book.title} <span className="mt-4 text-sm font-normal text-gray-400 md:text-xl">by {book.author}</span>
                </h1>
                <div className="my-4 flex flex-wrap gap-2">
                  {book.categories && book.categories.map((cat, idx) => (
                    <div key={idx} className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <a href={`/audiobooks?category=${encodeURIComponent(cat)}`}>{cat}</a>
                    </div>
                  ))}
                </div>
                <div className="text-md mt-2">
                  <div className="align-center flex w-full justify-between main-container">
                    <span className="font-bold text-gray-300">{t('Published Date')}:</span> <span className="font-normal text-gray-500">{book.year}</span>
                  </div>
                </div>
                <div className="text-md mt-4">
                  <div className="align-center flex w-full justify-between main-container">
                    <span className="font-bold text-gray-300">{t('Rating')}:</span> <span className="font-normal text-gray-500">{book.rating} / 5</span>
                  </div>
                </div>
                <div className="text-md mt-4">
                  <div className="align-center flex w-full justify-between main-container">
                    <span className="font-bold text-gray-300">{t('Maturity Rating')}:</span> <span className="font-normal text-gray-500">{book.maturity}</span>
                  </div>
                </div>
                <div className="mt-8">
                  <a href="#leave_a_comment" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2">{t('Leave a Comment')}</a>
                </div>
              </div>
            </div>
            <div className="z-1 relative mt-12 md:mt-8 md:px-16 xl:mt-12 xl:px-32">
              <CustomAudioPlayer src={book.audioUrl} title="Playing Track" trackNumber={1} />
            </div>
            <div id="leave_a_comment">
              <div>
                <div className="comments container z-50 mt-4 md:mt-8 md:px-16 xl:mt-12 xl:px-32 undefined">
                  <h3 className="text-lg font-semibold">{t('Comments')}</h3>
                  <div className="mt-4 flex justify-center">
                    <button className="mr-2 text-[#4f46e5] hover:underline">{t('Log in')}</button> {t('to write a comment')}
                  </div>
                  <div className="mt-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
