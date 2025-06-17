import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import channels from '@/data/channels.json';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ChannelPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const name = searchParams.get('name');
  const channel = channels.find(
    ch => String(ch.id) === String(id) || String(ch.name).toLowerCase() === String(name || '').toLowerCase()
  );

  // Fallbacks
  const channelName = channel?.name || name || 'Unknown Channel';
  const streamUrl = channel?.streamUrl || `https://gstreams.uk/tv-channel/${id}`;
  const logo = channel?.logo || '/logo.png';

  // SEO Schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: `Streaming - ${channelName}`,
    description: `Watch live streaming of ${channelName}`,
    contentUrl: window.location.href,
    embedUrl: window.location.href,
    uploadDate: new Date().toISOString(),
    thumbnailUrl: logo,
    potentialAction: {
      '@type': 'ViewAction',
      target: window.location.href,
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="relative flex-1 py-4 mt-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <div className="container">
          <div className="mt-8 flex flex-col items-center justify-center">
            <div className="mb-4 flex w-full flex-col items-center justify-between sm:flex-row">
              <a className="mb-2 sm:mb-0" href="/live-tv">
                <button
                  className="flex items-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-100 hover:text-gray-900 shadow"
                  onClick={e => {
                    e.preventDefault();
                    navigate('/live-tv');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-big-left mr-2"><path d="M18 15h-6v4l-7-7 7-7v4h6v6z"></path></svg>
                  {t('Back to search')}
                </button>
              </a>
              <h1 className="text-2xl font-bold sm:text-sm">
                {t('Now Streaming')}: <span className="font-normal text-gray-400">{channelName}</span>
              </h1>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <div className="relative size-full">
                <iframe
                  src={streamUrl}
                  className="absolute left-0 top-0 size-full border-none"
                  allowFullScreen
                  title={`Stream - ${channelName}`}
                  referrerPolicy="origin"
                />
              </div>
            </div>
            <div id="leave_a_comment" className="w-full">
              <div>
                <div className="comments container z-50 mt-4 md:mt-8 md:px-16 xl:mt-12 xl:px-32 w-full !p-0">
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
