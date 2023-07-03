import { useState } from "react";

import _ from "lodash";

const key = import.meta.env.VITE_KEY

const getImages = async () => {
  const response = await fetch(
    `https://api.jwstapi.com/all/suffix/_i2d?perPage=1000`,
    {
      headers: {
        "X-API-KEY": key,
      },
    }
  )
    .then((res) => res.json())
    .then((res) => res.body)
    .then((res) => res.filter((entry: any) => entry.file_type == "jpg"))
    .then((res) => res.map((entry: any) => entry.location));

  return response;
};

const imgList = await getImages();

const deserializeUrl = (url: string) => {
  const urlObj = new URL(url);
  const { origin, pathname } = urlObj;

  const regexp = /jwst--(\w+)-([^_]+)_.*/;
  const match = pathname.match(regexp);

  return {
    url,
    origin,
    pathname,
    program: match ? match[1] : null,
    observation: match ? match[2] : null,
    corsUrl: "https://corsproxy.io/?" + encodeURIComponent(url),
  };
};

const objToOP = (obj: any) => `${obj.program}-${obj.observation}`;

const imageObjects: {
  url: string;
  origin: string;
  pathname: string;
  program: string | null;
  observation: string | null;
  corsUrl: string;
}[] = imgList.map(deserializeUrl);
const observation_programs = [...new Set(imageObjects.map(objToOP))];

export const ImageShow = () => {
  const [obsIdx, setObsIdx] = useState(0);

  const cImageObjects = imageObjects.filter(
    (obj) => objToOP(obj) === observation_programs[obsIdx]
  );

  const [threeImages, setThreeImages] = useState<
    (
      | {
          url: string;
          origin: string;
          pathname: string;
          program: string | null;
          observation: string | null;
          corsUrl: string;
        }
      | undefined
    )[]
  >(cImageObjects.slice(0, 3));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
      }}
    >
      <button
        style={{
          margin: "auto",
        }}
        onClick={() => {
          const newIndex = _.random(0, observation_programs.length - 1);
          setObsIdx(newIndex);

          const sample = _.sampleSize(
            imageObjects.filter(
              (obj) => objToOP(obj) === observation_programs[newIndex]
            ),
            3
          );
          if (sample.length < 3) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sample.push(undefined);
          }
          setThreeImages(_.shuffle(sample));
        }}
      >
        Generate Unique Image
      </button>
      <svg xmlns="http://www.w3.org/2000/svg">
        <filter
          id="duotone_filter"
          colorInterpolationFilters="sRGB"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
        >
          {threeImages[0] && (
            <>
              <feImage xlinkHref={threeImages[0].url} />
              <feColorMatrix
                //in="SourceGraphic"
                type="matrix"
                result="img1"
                values="1 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 1"
              />
            </>
          )}

          {threeImages[1] && (
            <>
              <feImage xlinkHref={threeImages[1].url} />
              <feColorMatrix
                //in="SourceGraphic"
                type="matrix"
                result="img2"
                values="0 0 0 0 0
                  0 1 0 0 0
                  0 0 0 0 0
                  0 0 0 0 1"
              />
            </>
          )}

          {threeImages[2] && (
            <>
              <feImage xlinkHref={threeImages[2].url} />
              <feColorMatrix
                //in="SourceGraphic"
                type="matrix"
                result="img3"
                values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 1 0 0
                  0 0 0 0 1"
              />
            </>
          )}

          <feComposite
            in="img1"
            in2="img2"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
          />

          <feComposite
            in2="img3"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
          />
        </filter>
      </svg>
      <div
        style={{
          height: "50vh",
          maxWidth: "90%",
          marginBottom: "auto",
          // Make flex grow 1
          flex: "flex-grow",
          backgroundColor: "darkgrey",
        }}
      >
        <img
          style={{
            filter: "url(#duotone_filter)",
          }}
          src={cImageObjects[0].url}
          height={"100%"}
        />
      </div>
    </div>
  );
};
