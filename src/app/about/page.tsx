import React from "react";
import SectionFounder from "./SectionFounder";
import SectionStatistic from "./SectionStatistic";
import BgGlassmorphism from "@/components/BgGlassmorphism/BgGlassmorphism";
import BackgroundSection from "@/components/BackgroundSection/BackgroundSection";
import SectionHero from "./SectionHero";
import SectionClientSay from "@/components/SectionClientSay/SectionClientSay";
import SectionPromo3 from "@/components/SectionPromo3";
import Heading from "@/components/Heading/Heading";
import SectionMissionVision from "./SectionMissionVision";
import SectionCoreValues from "./SectionCoreValues";

// Server Component - Parent
const PageAbout = () => {
  return (
    <div className={`nc-PageAbout overflow-hidden relative`}>
      {/* ======== BG GLASS ======== */}
      <BgGlassmorphism />

      <div className="container py-16 lg:py-28 space-y-16 lg:space-y-28">
        {/* Hero Section - Dynamic from Module ID 11 */}
        <SectionHero />

        {/* Mission & Vision Section - Dynamic from Module ID 12 (Mission) and 13 (Vision) */}
        <SectionMissionVision />

        {/* Core Values Section - Dynamic from Module ID 14 */}
        <SectionCoreValues />

        {/* Our Story Section */}
        <div className="relative">
          <Heading
            desc="From humble beginnings to industry leaders"
          >
            📖 Our Story
          </Heading>
          <div className="mt-10 space-y-6">
            <div className="p-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Founded in 2015
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                Our journey began with a simple idea: to create products that truly matter. 
                What started as a small team of passionate individuals has grown into a thriving 
                company serving customers worldwide.
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Over the years, we've expanded our offerings, built lasting partnerships, and 
                maintained our commitment to quality and innovation. Today, we're proud to serve 
                thousands of satisfied customers and continue to push the boundaries of what's possible.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <SectionFounder />

        {/* Statistics Section */}
        <div className="relative py-16">
          <BackgroundSection />
          <SectionStatistic />
        </div>

        {/* Testimonials Section */}
        <div className="relative py-16">
          <BackgroundSection />
          <SectionClientSay />
        </div>

        {/* Why Choose Us Section */}
        <div className="relative">
          <Heading
            desc="What sets us apart from the competition"
          >
            ⭐ Why Choose Us
          </Heading>
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            {[
              {
                icon: "🎨",
                title: "Premium Quality",
                description: "We never compromise on quality. Every product is crafted with attention to detail and built to last."
              },
              {
                icon: "⚡",
                title: "Fast Delivery",
                description: "Get your orders delivered quickly and safely. We ensure prompt shipping and reliable service."
              },
              {
                icon: "🛡️",
                title: "24/7 Support",
                description: "Our dedicated support team is always here to help you, day or night, whenever you need us."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  {feature.title}
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <SectionPromo3 />
      </div>
    </div>
  );
};

export default PageAbout;
