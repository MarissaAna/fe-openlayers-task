import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map.js";
import View from "ol/View.js";
import OSM from "ol/source/OSM.js";
import { Draw, Snap } from "ol/interaction.js";
import { Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { fromLonLat } from "ol/proj.js";
import {
  CircleStop,
  CircleDot,
  Spline,
  Hexagon,
  ZoomOut,
  ZoomIn,
} from "lucide-react";

import { defaults as defaultControls } from "ol/control";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style.js";
import { LineString } from "ol/geom";
import { Overlay } from "ol";
import { unByKey } from "ol/Observable";
import { getVectorContext } from "ol/render";
import { easeOut } from "ol/easing";

// import {
//   style,
//   labelStyle,
//   tipStyle,
//   modifyStyle,
//   segmentStyle,
// } from "./components/Style";
// import { getArea, getLength } from "./utils/Measure";

// import { Polygon } from "ol/geom";

// const useMap = () => {}; logic yang dipisah bukan comp

function App() {
  const mapRef = useRef();
  const mapInstanceRef = useRef();
  const sourceRef = useRef(new VectorSource());
  const [drawInteraction, setDrawInteraction] = useState(null);
  const [editorStatus, setEditorStatus] = useState("None");

  useEffect(function initMap() {
    if (!mapRef.current) return;

    const tile = new TileLayer({ source: new OSM() });

    tile.on("prerender", (evt) => {
      // return
      if (evt.context) {
        const context = evt.context;
        context.filter = "grayscale(80%) invert(100%) ";
        context.globalCompositeOperation = "source-over";
      }
    });

    tile.on("postrender", (evt) => {
      if (evt.context) {
        const context = evt.context;
        context.filter = "none";
      }
    });

    //
    const duration = 1000;
    const source = new VectorSource();

    const vector = new VectorLayer({
      source: sourceRef.current,
      style: {
        "fill-color": "rgb(9, 96, 0, 0.5)",
        "stroke-color": "#18f400",
        "stroke-width": 2,
        "circle-radius": 7,
        "circle-fill-color": "#18f400",
        "icon-src":
          "https://emoticon.id/wp-content/uploads/2020/05/%F0%9F%94%A5-Api-WhatsApp.png",
        "icon-width": 40,
        "icon-height": 40,
      },
    });

    const map = new Map({
      layers: [tile, vector],
      view: new View({
        center: fromLonLat([107.60981, -6.914744]),
        zoom: 12,
      }),
      target: mapRef.current,
      controls: [],
    });

    //Animation
    source.on("addfeature", (e) => {
      const feature = e.feature;
      const start = Date.now();
      const flashGeom = feature.getGeometry().clone();
      const listenerKey = tile.on("postrender", (event) => {
        const frameState = event.frameState;
        const elapsed = frameState.time - start;
        if (elapsed >= duration) {
          unByKey(listenerKey);
          return;
        }
        const vectorContext = getVectorContext(event);
        const elapsedRatio = elapsed / duration;
        const radius = easeOut(elapsedRatio) * 35 + 5;
        const opacity = easeOut(1.5 - elapsedRatio);

        const style = new Style({
          image: new CircleStyle({
            radius: radius,
            stroke: new Stroke({
              color: "rgba(255, 255, 255, " + opacity + ")",
              width: 0.75 + opacity,
            }),
          }),
        });

        vectorContext.setStyle(style);
        vectorContext.drawGeometry(flashGeom);
        mapInstanceRef.current.render();
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(null);
    };
  }, []);

  const addInteraction = (type) => {
    const draw = new Draw({
      source: sourceRef.current,
      type,
    });

    mapInstanceRef.current.addInteraction(draw);
    const snap = new Snap({ source: sourceRef.current });
    mapInstanceRef.current.addInteraction(snap);
    setDrawInteraction(draw);
  };

  const toogleDrawInteraction = (type) => {
    const map = mapInstanceRef.current;
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
      setDrawInteraction(null);
      setEditorStatus("");
    } else {
      addInteraction(type);
      const snap = new Snap({ source: sourceRef.current });
      map.addInteraction(snap);
    }
  };

  // console.log("rerender");
  /**
   * Handles zooming in or out of the map.
   * @param {React.MutableRefObject<Map>} mapRef - Reference to the map instance.
   * @param {number} value - Zoom level adjustment.
   */

  const handleZoom = (mapRef, value) => {
    const map = mapRef.current;
    const view = map.getView();
    const zoom = view.getZoom();
    view.animate({ zoom: zoom + value, duration: 200 });
  };

  return (
    <>
      <div>
        <div className="w-full h-screen" ref={mapRef}>
          <div className="">
            <button
              onClick={() => handleZoom(mapInstanceRef, +2)}
              className="flex top-0 absolute z-10 bg-button p-1 m-2 rounded-md"
            >
              <ZoomIn />
            </button>
            <button
              onClick={() => handleZoom(mapInstanceRef, -2)}
              className="flex top-10 absolute z-10 bg-button p-1 m-2  rounded-md font-bold"
            >
              <ZoomOut />
            </button>
            <button
              onClick={() => {
                setEditorStatus("Point");
                toogleDrawInteraction("Point");
              }}
              className="flex top-30 absolute z-10 bg-button p-1 m-2 rounded-md"
            >
              {editorStatus === "Point" ? <CircleStop /> : <CircleDot />}
            </button>
            <button
              onClick={() => {
                setEditorStatus("LineString");
                toogleDrawInteraction("LineString");
              }}
              className="flex top-40 absolute z-10 bg-button p-1 m-2 rounded-md"
            >
              {editorStatus === "LineString" ? <CircleStop /> : <Spline />}
            </button>
            <button
              onClick={() => {
                setEditorStatus("Polygon");
                toogleDrawInteraction("Polygon");
              }}
              className="flex top-50 absolute z-10 bg-button p-1 m-2 rounded-md"
            >
              {editorStatus === "Polygon" ? <CircleStop /> : <Hexagon />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
