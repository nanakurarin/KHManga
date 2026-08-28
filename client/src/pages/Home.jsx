import React, { useState, useEffect } from 'react';
import { getRecentRomComManga, getLatestUpdates, getRecentlyAdded, getPopularManga } from '../services/mangaDexApi';
import HeroCarousel from '../components/home/HeroCarousel';
import ContinueReading from '../components/home/ContinueReading';
import MangaSection from '../components/manga/MangaSection';

function Home() {
  const [romComManga, setRomComManga] = useState([]);
  const [romComLoading, setRomComLoading] = useState(true);
  const [romComError, setRomComError] = useState('');

  const [latestUpdates, setLatestUpdates] = useState([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [latestError, setLatestError] = useState('');

  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [addedLoading, setAddedLoading] = useState(true);
  const [addedError, setAddedError] = useState('');

  const [popularManga, setPopularManga] = useState([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [popularError, setPopularError] = useState('');

  const fetchRecentRomCom = async () => {
    setRomComLoading(true);
    setRomComError('');
    try {
      const data = await getRecentRomComManga(10);
      setRomComManga(data);
    } catch (err) {
      console.error('Failed to retrieve recently updated RomCom manga:', err);
      setRomComError(err.message || 'Failed to fetch recently updated RomCom titles.');
    } finally {
      setRomComLoading(false);
    }
  };

  const fetchLatestUpdates = async () => {
    setLatestLoading(true);
    setLatestError('');
    try {
      const data = await getLatestUpdates(10);
      setLatestUpdates(data);
    } catch (err) {
      console.error('Failed to retrieve latest updates:', err);
      setLatestError(err.message || 'Failed to fetch latest updates.');
    } finally {
      setLatestLoading(false);
    }
  };

  const fetchRecentlyAdded = async () => {
    setAddedLoading(true);
    setAddedError('');
    try {
      const data = await getRecentlyAdded(10);
      setRecentlyAdded(data);
    } catch (err) {
      console.error('Failed to retrieve recently added manga:', err);
      setAddedError(err.message || 'Failed to fetch recently added manga.');
    } finally {
      setAddedLoading(false);
    }
  };

  const fetchPopular = async () => {
    setPopularLoading(true);
    setPopularError('');
    try {
      const data = await getPopularManga(10);
      setPopularManga(data);
    } catch (err) {
      console.error('Failed to retrieve popular manga:', err);
      setPopularError(err.message || 'Failed to fetch popular titles.');
    } finally {
      setPopularLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentRomCom();
    fetchLatestUpdates();
    fetchRecentlyAdded();
    fetchPopular();
  }, []);

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Carousel Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-sans">Recently Updated RomCom</h2>
        <HeroCarousel
          mangaList={romComManga}
          loading={romComLoading}
          error={romComError}
        />
      </section>

      {/* Continue Reading Section */}
      <ContinueReading />

      {/* Latest Updates Section */}
      <MangaSection
        title="Latest Updates"
        manga={latestUpdates}
        loading={latestLoading}
        error={latestError}
        viewMorePath="/browse?order=Latest+Updates"
        cardProps={{ showTags: true }}
      />

      {/* Recently Added Section */}
      <MangaSection
        title="Recently Added"
        manga={recentlyAdded}
        loading={addedLoading}
        error={addedError}
        viewMorePath="/browse?sort=recently_added"
        cardProps={{ showTags: true }}
      />

      {/* Popular Titles Section */}
      <MangaSection
        title="Popular Titles"
        manga={popularManga}
        loading={popularLoading}
        error={popularError}
        viewMorePath="/browse?sort=highest rating"
        cardProps={{ showRating: true, showTags: true }}
      />
    </div>
  );
}

export default Home;
