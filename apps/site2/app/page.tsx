import Image from "next/image";
import BackgroundImage from "../public/background.png";
import { ComponentProps, ReactNode } from "react";

export default function Home() {
  return (
    <div className=" text-[32px] leading-[normal] font-minecraft ">
      <Background />
      <div className="grid grid-cols-3 w-fit gap-8">
        <Box className="text-mc-green">
          <p className="text-mc-2">Wins</p>
          <p className="text-mc-4">8,056</p>
        </Box>
        <Box className="text-mc-red">
          <p className="text-mc-2">Losses</p>
          <p className="text-mc-4">1,656</p>
        </Box>
        <Box className="text-mc-gold">
          <p className="text-mc-2">WLR</p>
          <p className="text-mc-4">4.86</p>
        </Box>
        <Box className="text-mc-green">
          <p className="text-mc-2">Final Kills</p>
          <p className="text-mc-4">27,210</p>
        </Box>
        <Box className="text-mc-red">
          <p className="text-mc-2">Final Deaths</p>
          <p className="text-mc-4">1,919</p>
        </Box>
        <Box className="text-mc-gold">
          <p className="text-mc-2">FKDR</p>
          <p className="text-mc-4">14.18</p>
        </Box>
        <Box className="text-mc-green">
          <p className="text-mc-2">Kills</p>
          <p className="text-mc-4">37,105</p>
        </Box>
        <Box className="text-mc-red">
          <p className="text-mc-2">Deaths</p>
          <p className="text-mc-4">39,353</p>
        </Box>
        <Box className="text-mc-gold">
          <p className="text-mc-2">KDR</p>
          <p className="text-mc-4">0.94</p>
        </Box>
        <Box className="text-mc-green">
          <p className="text-mc-2">Beds Broken</p>
          <p className="text-mc-4">12,120</p>
        </Box>
        <Box className="text-mc-red">
          <p className="text-mc-2">Beds Lost</p>
          <p className="text-mc-4">2,775</p>
        </Box>
        <Box className="text-mc-gold">
          <p className="text-mc-2">BBLR</p>
          <p className="text-mc-4">4.37</p>
        </Box>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute w-screen h-[80dvh]">
      <Image src={BackgroundImage} alt="" fill={true} className="object-cover" />
      <div
        className=" absolute w-full h-full"
        style={{
          background: "linear-gradient(180deg, rgba(17, 17, 17, 0) 0%, rgba(17, 17, 17, 0) 20%, rgba(17, 17, 17, 1) 100%)",
        }}
      />
    </div>
  )
}

function Box({ className, ...props }: ComponentProps<"div">) {
  const border = {
    topLeft: 8,
    topRight: 8,
    bottomLeft: 8,
    bottomRight: 8,
  };

  const shadow = 8;

  return (
    <div className="relative">
      <div
        className="absolute bg-black/42 w-full h-full"
        style={{
          transform: `translate(${shadow}px, ${shadow}px)`,
          clipPath: `polygon(
            ${border.bottomRight !== 0 ? `
              calc(100% - ${border.bottomRight + shadow}px) calc(100% - ${border.bottomRight + shadow}px),
              calc(100% - ${shadow}px) calc(100% - ${border.bottomRight + shadow}px),
              calc(100% - ${shadow}px) calc(100% - ${shadow}px),
              calc(100% - ${border.bottomRight + shadow}px) calc(100% - ${shadow}px),
              calc(100% - ${border.bottomRight + shadow}px) calc(100% - ${border.bottomRight + shadow}px),
            ` : ""}

            ${border.bottomLeft}px calc(100% - ${shadow}px),
            ${border.bottomLeft}px 100%,
            calc(100% - ${border.bottomRight || shadow}px) 100%,
            calc(100% - ${border.bottomRight || shadow}px) calc(100% - ${shadow}px),
            ${border.bottomLeft}px calc(100% - ${shadow}px),
      
            ${border.bottomRight !== 0 ? `calc(100% - ${border.bottomRight + shadow}px) calc(100% - ${border.bottomRight + shadow}px),` : ""}

            calc(100% - ${shadow}px) ${border.topRight}px,
            100% ${border.topRight}px,
            100% calc(100% - ${border.bottomRight}px),
            calc(100% - ${shadow}px) calc(100% - ${border.bottomRight}px),
            calc(100% - ${shadow}px) ${border.topRight}px,
      
            ${border.bottomRight !== 0 ? `calc(100% - ${border.bottomRight + shadow}px) calc(100% - ${border.bottomRight + shadow}px)` : `${border.bottomLeft}px calc(100% - ${shadow}px)`}
          )`
        }}
      />
      <div
        className="absolute w-full h-full z-10 "
        style={{
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(0, 0, 0, 0.3))",
          mixBlendMode: "overlay",
          clipPath: `polygon(
            ${border.topLeft}px 0, 
            calc(100% - ${border.topRight}px) 0, 
            calc(100% - ${border.topRight}px) ${border.topRight}px,
            100% ${border.topRight}px,
            100% calc(100% - ${border.bottomRight}px),
            calc(100% - ${border.bottomRight}px) calc(100% - ${border.bottomRight}px),
            calc(100% - ${border.bottomRight}px) 100%,
            ${border.bottomLeft}px 100%,
            ${border.bottomLeft}px calc(100% - ${border.bottomLeft}px),
            0 calc(100% - ${border.bottomLeft}px),
            0px ${border.topLeft}px,
            ${border.topLeft}px ${border.topLeft}px
            )`,
        }}
      />
      <div
        className="p-4 bg-black/50 backdrop-blur-lg"
        style={{
          clipPath: `polygon(
            ${border.topLeft}px 0, 
            calc(100% - ${border.topRight}px) 0, 
            calc(100% - ${border.topRight}px) ${border.topRight}px,
            100% ${border.topRight}px,
            100% calc(100% - ${border.bottomRight}px),
            calc(100% - ${border.bottomRight}px) calc(100% - ${border.bottomRight}px),
            calc(100% - ${border.bottomRight}px) 100%,
            ${border.bottomLeft}px 100%,
            ${border.bottomLeft}px calc(100% - ${border.bottomLeft}px),
            0 calc(100% - ${border.bottomLeft}px),
            0px ${border.topLeft}px,
            ${border.topLeft}px ${border.topLeft}px
            )`,
        }}
      >
        <div {...props} className={`z-20 flex flex-col gap-4 items-center ${className}`} />
      </div>
    </div>
  )
}