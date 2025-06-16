import React from 'react';
import { Link } from 'react-router-dom';

const ShowsDropdown = () => (
  <div className="absolute left-0 top-full flex justify-center items-start text-left">
    <div data-state="open" data-orientation="horizontal" className="origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]" style={{textAlign: 'left', '--radix-navigation-menu-viewport-width': '650px', '--radix-navigation-menu-viewport-height': '593px'}}>
      <div aria-labelledby="shows-dropdown-trigger" data-orientation="horizontal" className="left-0 top-0 w-full md:absolute md:w-auto" style={{textAlign: 'left'}}>
        <div className="p-6 pb-0" style={{textAlign: 'left'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tv mr-1 inline size-4"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg> Shows
          <p className="mt-2 text-sm">Embark on a journey through the world of TV shows. From the latest hits to timeless classics, discover new stories and revisit your favorites.</p>
        </div>
        <div className="grid w-[650px] grid-cols-2 p-4" style={{textAlign: 'left'}}>
          <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent bg-[#43437b] hover:bg-[#333385]" to="/tv/discover">
            <div className="text-sm font-medium leading-none">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-telescope mr-2 inline size-3"><path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"></path><path d="m13.56 11.747 4.332-.924"></path><path d="M16 21-3.105-6.21"></path><path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"></path><path d="m6.158 8.633 1.114 4.456"></path><path d="m8 21 3.105-6.21"></path><circle cx="12" cy="13" r="2"></circle></svg> Discover
                <div className="inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 ml-2 px-1 py-0 text-[9px] leading-normal tracking-wide">NEW</div>
              </div>
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Unearth new TV shows and hidden gems in the vast landscape of television. Whether you're into dramas, comedies, or thrillers, there's always something new to discover.</p>
          </Link>
          <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent" to="/tv/popular">
            <div className="text-sm font-medium leading-none">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart mr-2 inline size-3"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg> Popular
              </div>
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Dive into the world of popular TV shows that have captured the hearts of audiences worldwide. From binge-worthy series to critically acclaimed dramas, discover what's trending in the TV universe.</p>
          </Link>
          <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent" to="/tv/airing-today">
            <div className="text-sm font-medium leading-none">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play mr-2 inline size-3"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg> Airing Today
              </div>
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Don't miss out on the latest episodes of your favorite TV shows airing today. Stay up-to-date with the newest content from networks and streaming platforms.</p>
          </Link>
          <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent" to="/tv/on-the-air">
            <div className="text-sm font-medium leading-none">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-radio-tower mr-2 inline size-3"><path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9"></path><path d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5"></path><circle cx="12" cy="9" r="2"></circle><path d="M16.2 4.8c2 2 2.26 5.11.8 7.47"></path><path d="M19.1 1.9a9.96 9.96 0 0 1 0 14.1"></path><path d="M9.5 18h5"></path><path d="m8 22 4-11 4 11"></path></svg> On The Air
              </div>
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Tune in to the latest buzz with shows currently on the air. From gripping dramas to laugh-out-loud comedies, watch what's captivating audiences right now.</p>
          </Link>
          <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent" to="/tv/top-rated">
            <div className="text-sm font-medium leading-none">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star mr-2 inline size-3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Top Rated
              </div>
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Explore the pinnacle of television excellence with our collection of top-rated TV shows. These series have been recognized for their outstanding storytelling, acting, and production values.</p>
          </Link>
          <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent" to="/tv/anime-series?with_watch_providers=283%7C1968c">
            <div className="text-sm font-medium leading-none">
              <div className="flex items-center">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" role="img" viewBox="0 0 24 24" className="mr-2 inline size-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M2.933 13.467a10.55 10.55 0 1 1 21.067-.8V12c0-6.627-5.373-12-12-12S0 5.373 0 12s5.373 12 12 12h.8a10.617 10.617 0 0 1-9.867-10.533zM19.2 14a3.85 3.85 0 0 1-1.333-7.467A7.89 7.89 0 0 0 14 5.6a8.4 8.4 0 1 0 8.4 8.4 6.492 6.492 0 0 0-.133-1.6A3.415 3.415 0 0 1 19.2 14z"></path></svg> Anime TV Shows
              </div>
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Dive into the vast world of anime series, from ongoing hits to all-time classics. Find your next binge-worthy show across all genres and art styles.</p>
          </Link>
        </div>
        <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-px w-full my-1"></div>
        <div className="grid w-[650px] grid-cols-2 p-4" style={{textAlign: 'left'}}>
          <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent" to="/tv/netflix?with_watch_providers=8">
            <div className="text-sm font-medium leading-none">
              <div className="flex items-center">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" role="img" viewBox="0 0 24 24" className="mr-2 inline size-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"></path></svg> Netflix
              </div>
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Dive into Netflix's vast library of original series, blockbuster movies, documentaries, and more. Stay ahead with their continually updated selection of binge-worthy content.</p>
          </Link>
          <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent" to="/tv/disney?with_watch_providers=337c">
            <div className="text-sm font-medium leading-none">
              <div className="flex items-center">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="mr-2 inline size-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M3.22 5.838c-1.307 -.15 -1.22 -.578 -1.22 -.794c0 -.216 .424 -1.044 4.34 -1.044c4.694 0 14.66 3.645 14.66 10.042s-8.71 4.931 -10.435 4.52c-1.724 -.412 -5.565 -2.256 -5.565 -4.174c0 -1.395 3.08 -2.388 6.715 -2.388c3.634 0 5.285 1.041 5.285 2c0 .5 -.074 1.229 -1 1.5"></path><path d="M10.02 8a505.153 505.153 0 0 0 0 13"></path></svg> Disney
              </div>
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Enter the enchanting world of Disney Plus, where you can find all your favorite Disney classics, along with Pixar animations, Marvel adventures, Star Wars sagas, and National Geographic explorations.</p>
          </Link>
          <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent" to="/tv/apple?with_watch_providers=350%7C2c">
            <div className="text-sm font-medium leading-none">
              <div className="flex items-center">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" role="img" viewBox="0 0 24 24" className="mr-2 inline size-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M20.57 17.735h-1.815l-3.34-9.203h1.633l2.02 5.987c.075.231.273.9.586 2.012l.297-.997.33-1.006 2.094-6.004H24zm-5.344-.066a5.76 5.76 0 0 1-1.55.207c-1.23 0-1.84-.693-1.84-2.087V9.646h-1.063V8.532h1.121V7.081l1.476-.602v2.062h1.707v1.113H13.38v5.805c0 .446.074.75.214.932.14.182.396.264.75.264.207 0 .495-.041.883-.115zm-7.29-5.343c.017 1.764 1.55 2.358 1.567 2.366-.017.042-.248.842-.808 1.658-.487.71-.99 1.418-1.79 1.435-.783.016-1.03-.462-1.93-.462-.89 0-1.17.445-1.913.478-.758.025-1.344-.775-1.838-1.484-.998-1.451-1.765-4.098-.734-5.88.51-.89 1.426-1.451 2.416-1.46.75-.016 1.468.512 1.93.512.461 0 1.327-.627 2.234-.536.38.016 1.452.157 2.136 1.154-.058.033-1.278.743-1.27 2.219M6.468 7.988c.404-.495.685-1.18.61-1.864-.585.025-1.294.388-1.723.883-.38.437-.71 1.138-.619 1.806.652.05 1.328-.338 1.732-.825Z"></path></svg> Apple TV+
              </div>
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Discover Apple TV+'s lineup of critically acclaimed series, compelling dramas, and groundbreaking documentaries. Enjoy a selection curated with quality and innovation in mind.</p>
          </Link>
          <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent" to="/tv/prime?with_watch_providers=9%7C10c">
            <div className="text-sm font-medium leading-none">
              <div className="flex items-center">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" role="img" viewBox="0 0 24 24" className="mr-2 inline size-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M22.787 15.292c-.336-.43-2.222-.204-3.069-.103-.257.031-.296-.193-.065-.356 1.504-1.056 3.968-.75 4.255-.397.288.357-.076 2.827-1.485 4.007-.217.18-.423.084-.327-.155.317-.792 1.027-2.566.69-2.996m-1.093 1.248c-2.627 1.94-6.437 2.97-9.717 2.97-4.597 0-8.737-1.7-11.87-4.528-.246-.222-.026-.525.27-.353 3.38 1.967 7.559 3.151 11.876 3.151a23.63 23.63 0 0 0 9.06-1.854c.444-.188.816.293.381.614m.482-5.038c-.761 0-1.346-.209-1.755-.626-.409-.418-.613-1.017-.613-1.797 0-.799.209-1.425.627-1.88.418-.454.998-.682 1.741-.682.572 0 1.019.138 1.341.415.323.276.484.645.484 1.105 0 .461-.174.81-.52 1.046-.348.237-.86.355-1.535.355-.35 0-.654-.034-.912-.101.037.411.161.706.373.884.212.178.533.268.963.268.172 0 .34-.011.502-.033a6.208 6.208 0 0 0 .733-.157.304.304 0 0 1 .046-.004c.104 0 .156.07.156.212v.424c0 .098-.013.167-.04.207a.341.341 0 0 1-.162.106 3.954 3.954 0 0 1-1.429.258m-.304-2.893c.314 0 .541-.048.682-.143.142-.095.212-.241.212-.438 0-.387-.23-.58-.69-.58-.59 0-.931.362-1.024 1.087.246.05.52.074.82.074m-9.84 2.755c-.08 0-.139-.018-.176-.055-.036-.037-.055-.096-.055-.175V6.886c0-.086.019-.146.055-.18.037-.034.096-.05.176-.05h.663c.141 0 .227.067.258.202l.074.249c.325-.215.619-.367.88-.456.26-.09.53-.134.806-.134.553 0 .943.197 1.17.59a3.77 3.77 0 0 1 .885-.452c.276-.092.562-.138.857-.138.43 0 .763.12 1 .36.236.239.354.574.354 1.004v3.253c0 .08-.017.138-.05.175-.034.037-.094.055-.18.055h-.885c-.08 0-.138-.018-.175-.055-.037-.037-.055-.096-.055-.175V8.176c0-.418-.188-.627-.562-.627-.332 0-.667.08-1.005.24v3.345c0 .08-.017.138-.05.175-.034.037-.094.055-.18.055h-.884c-.08 0-.139-.018-.176-.055-.036-.037-.055-.096-.055-.175V8.176c0-.418-.187-.627-.562-.627-.344 0-.682.083-1.013.249v3.336c0 .08-.017.138-.051.175-.034.037-.094.055-.18.055zM9.987 5.927c-.234 0-.42-.064-.562-.193-.142-.129-.212-.304-.212-.525 0-.221.07-.397.212-.526.141-.129.328-.193.562-.193.233 0 .42.064.562.193a.676.676 0 0 1 .212.526c0 .22-.07.396-.212.525-.141.129-.329.193-.562.193m-.443 5.437c-.08 0-.138-.019-.175-.055-.037-.037-.055-.096-.055-.176V6.886c0-.086.018-.146.055-.18.037-.034.096-.05.175-.05h.885c.086 0 .146.016.18.05s.05.094.05.18v4.247c0 .08-.017.139-.05.176-.034.036-.094.055-.18.055zm-3.681 0c-.08 0-.139-.018-.176-.055-.036-.037-.055-.096-.055-.175V6.886c0-.086.019-.146.055-.18.037-.034.096-.05.176-.05h.663c.141 0 .227.067.258.202l.12.497c.245-.27.477-.462.695-.575.219-.114.45-.17.696-.17h.13c.085 0 .147.016.183.05.037.034.056.094.056.18v.773c0 .08-.017.139-.051.176-.034.036-.094.055-.18.055a1.93 1.93 0 0 1-.166-.01 2.968 2.968 0 0 0-.258-.009c-.14 0-.313.02-.516.06-.202.04-.374.091-.515.152v3.097c0 .08-.018.138-.051.175-.034.037-.094.055-.18.055zM.344 13.262c-.08 0-.138-.017-.175-.05-.037-.034-.055-.095-.055-.18V6.886c0-.086.018-.146.055-.18.037-.034.095-.05.175-.05h.664c.14 0 .227.067.258.202l.064.24a2.03 2.03 0 0 1 .668-.424 2.13 2.13 0 0 1 .797-.157c.596 0 1.067.218 1.414.654.348.437.521 1.026.521 1.77 0 .51-.086.955-.258 1.336-.172.38-.405.674-.7.88a1.727 1.727 0 0 1-1.014.308c-.252 0-.491-.04-.719-.12a1.74 1.74 0 0 1-.58-.331v2.018c0 .085-.017.146-.05.18-.034.033-.095.05-.18.05zm2.018-2.81c.344 0 .597-.117.76-.35.163-.234.245-.603.245-1.106 0-.51-.08-.882-.24-1.115-.16-.234-.415-.35-.765-.35-.32 0-.62.083-.903.248v2.424c.27.166.571.249.903.249Z"></path></svg> Amazon Prime
              </div>
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Explore Amazon Prime's diverse offerings, including exclusive Amazon Originals, popular movies, and hit TV shows. Enjoy perks like early access to releases and Amazon Channels.</p>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default ShowsDropdown;
