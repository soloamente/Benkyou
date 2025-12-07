import { cn } from "@lib/utils";
import Image from "next/image";

export default function Cards({ className }: { className?: string }) {
  return (
    <>
      {/* Top hero image */}
      <div
        className={cn(
          "fixed top-0 left-0 w-full pointer-events-none z-0 overflow-visible",
          className
        )}
      >
        <div className="relative w-full overflow-visible">
          <Image
            src="/hero/top.png"
            alt="Cards top"
            width={10000}
            height={10000}
            className="w-full h-auto object-contain"
            unoptimized
          />
        </div>
      </div>

      {/* Right hero image */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full pointer-events-none z-1 overflow-visible",
          className
        )}
      >
        <div className="relative h-full overflow-visible">
          <Image
            src="/hero/right.png"
            alt="Cards right"
            width={10000}
            height={10000}
            className="h-full w-auto object-contain"
            unoptimized
          />
        </div>
      </div>

      {/* Left hero image */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full pointer-events-none z-1 overflow-visible",
          className
        )}
      >
        <div className="relative h-full overflow-visible">
          <Image
            src="/hero/left.png"
            alt="Cards left"
            width={10000}
            height={10000}
            className="h-full w-auto object-contain"
            unoptimized
          />
        </div>
      </div>

      {/* Bottom hero image */}
      <div
        className={cn(
          "fixed bottom-0 left-0 w-full pointer-events-none z-0 overflow-visible",
          className
        )}
      >
        <div className="relative w-full overflow-visible">
          <Image
            src="/hero/bottom.png"
            alt="Cards bottom"
            width={10000}
            height={10000}
            className="w-full h-auto object-contain"
            unoptimized
          />
        </div>
      </div>
      {/* <div className="flex flex-col justify-start font-medium  absolute shadow-lg shadow-black/50 rotate-70 px-7.5 py-10 -bottom-20 gap-14 -left-40 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-[1.375rem]">
          World War I space place from ?? to ??...
        </h1>
        <h2 className="text-[1.375rem]">
          The space of the are from A to D is equal to...
        </h2>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-9 px-7.5 py-10 -bottom-20 gap-14 left-15 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-[1.375rem]">
          World War I space place from ?? to ??...
        </h1>
        <h2 className="text-[1.375rem]">
          The space of the are from A to D is equal to...
        </h2>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-10 px-7.5 py-10 -bottom-30 gap-14 left-70 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-[1.375rem] font-mPlusRounded">
          俺はスマホで
          <span className="text-[#4FB4FF] ">写真 を撮った。</span>
        </h1>
        <h2 className="text-[1.375rem] text-[#4FB4FF]">Take a picture</h2>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-11 px-7.5 py-10 -bottom-40 gap-14 left-175 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-4xl">Pythagorean theorem</h1>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-10 px-7.5 py-10 -bottom-20 gap-14 left-130 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-[1.375rem]">
          World War I took place from <span className="text-[#737373]">??</span>{" "}
          to <span className="text-[#737373]">??</span>
        </h1>
        <h2 className="text-[1.375rem]">
          World War I took place from{" "}
          <span className="text-[#737373]">1914</span> to{" "}
          <span className="text-[#737373]">1918</span>.
        </h2>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-11 px-7.5 py-10 -bottom-20 gap-14 left-235 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-5xl">
          How do you say <span className="text-[#FFB640]">Hello</span> in
          spanish?
        </h1>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-11 px-7.5 py-10 -bottom-25 gap-14 left-350 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-[1.375rem] font-mPlusRounded">
          俺はスマホで
          <span className="text-[#4FB4FF] ">写真 を撮った。</span>
        </h1>
        <h2 className="text-[1.375rem] text-[#4FB4FF]">Take a picture</h2>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-3 px-7.5 py-10 -bottom-40 gap-14 left-295 bg-card w-3xs h-80 rounded-4xl items-center">
        <h1 className="text-4xl">Who's the creator of Benkyō</h1>
      </div> */}
    </>
  );
}
