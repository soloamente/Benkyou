import { cn } from "@lib/utils";

export default function CardsBottom({ className }: { className?: string }) {
  return (
    <div className={cn(" w-full h-full absolute bottom-0 left-0", className)}>
      {/* Card 1 - Leftmost card, hidden on mobile, visible from md */}
      <div className="hidden md:flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-70 px-4 md:px-7.5 py-6 md:py-10 -bottom-10 md:-bottom-20 gap-8 md:gap-14 -left-20 md:-left-40 bg-card w-48 md:w-3xs h-64 md:h-80 rounded-4xl items-start">
        <h1 className="text-sm md:text-[1.375rem]">
          World War I space place from ?? to ??...
        </h1>
        <h2 className="text-sm md:text-[1.375rem]">
          The space of the are from A to D is equal to...
        </h2>
      </div>

      {/* Card 2 - Second card, positioned responsively */}
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-9 px-4 md:px-7.5 py-6 md:py-10 -bottom-10 md:-bottom-20 gap-8 md:gap-14 left-[5%] md:left-15 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-start">
        <h1 className="text-sm md:text-[1.375rem]">
          World War I space place from ?? to ??...
        </h1>
        <h2 className="text-sm md:text-[1.375rem]">
          The space of the are from A to D is equal to...
        </h2>
      </div>

      {/* Card 3 - Japanese card */}
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-10 px-4 md:px-7.5 py-6 md:py-10 -bottom-16 md:-bottom-30 gap-8 md:gap-14 left-[25%] md:left-70 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-start">
        <h1 className="text-sm md:text-[1.375rem] font-mPlusRounded">
          俺はスマホで
          <span className="text-[#4FB4FF] ">写真 を撮った。</span>
        </h1>
        <h2 className="text-sm md:text-[1.375rem] text-[#4FB4FF]">
          Take a picture
        </h2>
      </div>

      {/* Card 4 - Pythagorean theorem, hidden on small screens */}
      <div className="hidden sm:flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-11 px-4 md:px-7.5 py-6 md:py-10 -bottom-20 md:-bottom-40 gap-8 md:gap-14 left-[45%] md:left-175 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-start">
        <h1 className="text-2xl md:text-4xl">Pythagorean theorem</h1>
      </div>

      {/* Card 5 - World War I dates */}
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-10 px-4 md:px-7.5 py-6 md:py-10 -bottom-10 md:-bottom-20 gap-8 md:gap-14 left-[35%] md:left-130 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-start">
        <h1 className="text-sm md:text-[1.375rem]">
          World War I took place from <span className="text-[#737373]">??</span>{" "}
          to <span className="text-[#737373]">??</span>
        </h1>
        <h2 className="text-sm md:text-[1.375rem]">
          World War I took place from{" "}
          <span className="text-[#737373]">1914</span> to{" "}
          <span className="text-[#737373]">1918</span>.
        </h2>
      </div>

      {/* Card 6 - Spanish greeting, hidden on small screens */}
      <div className="hidden lg:flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-11 px-4 md:px-7.5 py-6 md:py-10 -bottom-10 md:-bottom-20 gap-8 md:gap-14 left-[55%] md:left-235 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-start">
        <h1 className="text-3xl md:text-5xl">
          How do you say <span className="text-[#FFB640]">Hello</span> in
          spanish?
        </h1>
      </div>

      {/* Card 7 - Second Japanese card, hidden on medium screens */}
      <div className="hidden xl:flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-11 px-4 md:px-7.5 py-6 md:py-10 -bottom-12 md:-bottom-25 gap-8 md:gap-14 left-[65%] md:left-350 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-start">
        <h1 className="text-sm md:text-[1.375rem] font-mPlusRounded">
          俺はスマホで
          <span className="text-[#4FB4FF] ">写真 を撮った。</span>
        </h1>
        <h2 className="text-sm md:text-[1.375rem] text-[#4FB4FF]">
          Take a picture
        </h2>
      </div>

      {/* Card 8 - Benkyō creator, hidden on small screens */}
      <div className="hidden md:flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-3 px-4 md:px-7.5 py-6 md:py-10 -bottom-20 md:-bottom-40 gap-8 md:gap-14 left-[50%] md:left-295 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-center">
        <h1 className="text-2xl md:text-4xl">Who's the creator of Benkyō</h1>
      </div>

      {/* Card 9 - Math equation, visible on larger screens */}
      <div className="hidden lg:flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-12 px-4 md:px-7.5 py-6 md:py-10 -bottom-15 md:-bottom-25 gap-8 md:gap-14 left-[70%] md:left-420 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-start">
        <h1 className="text-2xl md:text-4xl">
          E = mc<span className="text-[#737373]">²</span>
        </h1>
        <h2 className="text-sm md:text-[1.375rem] text-[#737373]">
          Einstein's mass-energy equivalence
        </h2>
      </div>

      {/* Card 10 - French phrase, visible on medium screens */}
      <div className="hidden md:flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-6 px-4 md:px-7.5 py-6 md:py-10 -bottom-12 md:-bottom-22 gap-8 md:gap-14 left-[60%] md:left-380 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-start">
        <h1 className="text-sm md:text-[1.375rem]">
          Comment dit-on <span className="text-[#FFB640]">Bonjour</span> en
          français?
        </h1>
        <h2 className="text-sm md:text-[1.375rem] text-[#737373]">Hello</h2>
      </div>

      {/* Card 11 - Chemistry, visible on larger screens */}
      <div className="hidden xl:flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-8 px-4 md:px-7.5 py-6 md:py-10 -bottom-18 md:-bottom-35 gap-8 md:gap-14 left-[75%] md:left-480 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-start">
        <h1 className="text-2xl md:text-4xl">H₂O</h1>
        <h2 className="text-sm md:text-[1.375rem] text-[#737373]">
          Water molecule
        </h2>
      </div>

      {/* Card 12 - History question, visible on tablet and up */}
      <div className="hidden sm:flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-5 px-4 md:px-7.5 py-6 md:py-10 -bottom-14 md:-bottom-28 gap-8 md:gap-14 left-[20%] md:left-90 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-start">
        <h1 className="text-sm md:text-[1.375rem]">
          When did the <span className="text-[#737373]">Berlin Wall</span> fall?
        </h1>
        <h2 className="text-sm md:text-[1.375rem]">
          <span className="text-[#737373]">1989</span>
        </h2>
      </div>

      {/* Card 13 - Geography, visible on larger screens */}
      <div className="hidden lg:flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-15 px-4 md:px-7.5 py-6 md:py-10 -bottom-22 md:-bottom-32 gap-8 md:gap-14 left-[80%] md:left-520 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-start">
        <h1 className="text-2xl md:text-4xl">
          What is the <span className="text-[#4FB4FF]">capital</span> of Japan?
        </h1>
        <h2 className="text-sm md:text-[1.375rem] text-[#737373]">Tokyo</h2>
      </div>

      {/* Card 14 - Literature, visible on medium screens */}
      <div className="hidden md:flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-8 px-4 md:px-7.5 py-6 md:py-10 -bottom-16 md:-bottom-30 gap-8 md:gap-14 left-[8%] md:left-20 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-start">
        <h1 className="text-sm md:text-[1.375rem]">
          Who wrote <span className="text-[#FFB640]">Romeo and Juliet</span>?
        </h1>
        <h2 className="text-sm md:text-[1.375rem] text-[#737373]">
          William Shakespeare
        </h2>
      </div>

      {/* Card 15 - Science, visible on larger screens */}
      <div className="hidden xl:flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-5 px-4 md:px-7.5 py-6 md:py-10 -bottom-10 md:-bottom-20 gap-8 md:gap-14 left-[85%] md:left-560 bg-card w-40 md:w-3xs h-56 md:h-80 rounded-4xl items-start">
        <h1 className="text-sm md:text-[1.375rem]">
          How many planets are in our{" "}
          <span className="text-[#4FB4FF]">solar system</span>?
        </h1>
        <h2 className="text-2xl md:text-4xl text-[#737373]">8</h2>
      </div>
    </div>
  );
}
