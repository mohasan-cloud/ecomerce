import React from "react";
import SectionHowItWork from "@/components/SectionHowItWork/SectionHowItWork";
import BackgroundSection from "@/components/BackgroundSection/BackgroundSection";
import SectionSliderLargeProduct from "@/components/SectionSliderLargeProduct";
import SectionSliderProductCard from "@/components/SectionSliderProductCard";
import SectionGridMoreExplore from "@/components/SectionGridMoreExplore/SectionGridMoreExplore";
import SectionPromo1 from "@/components/SectionPromo1";
import SectionPromo2 from "@/components/SectionPromo2";
import SectionHero3 from "@/components/SectionHero/SectionHero3";
import SectionGridFeatureItems from "@/components/SectionGridFeatureItems";

function PageHome2() {
  return (
    <div className="nc-PageHome2 relative overflow-hidden">
      <div className="container px-4">
        <SectionHero3 />
      </div>

      <div className="container relative space-y-24 my-24 lg:space-y-32 lg:my-32">
        <SectionHowItWork />

        {/* SECTION */}
        <SectionSliderProductCard
          subHeading="New Sports equipment"
          limit={8}
        />

        {/* SECTION */}
        <SectionPromo2 />

        {/* SECTION 3 */}
        <SectionSliderLargeProduct />

        {/* SECTION */}
        <div className="relative py-24 lg:py-32">
          <BackgroundSection />
          <SectionGridMoreExplore />
        </div>

        {/* SECTION */}
        <SectionGridFeatureItems limit={8} />

        {/* SECTION */}
        <SectionPromo1 />
      </div>
    </div>
  );
}

export default PageHome2;
