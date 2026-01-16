"use client";

import React, { FC, useState } from "react";
import SocialsList from "@/shared/SocialsList/SocialsList";
import Label from "@/components/Label/Label";
import Input from "@/shared/Input/Input";
import Textarea from "@/shared/Textarea/Textarea";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import BackgroundSection from "@/components/BackgroundSection/BackgroundSection";
import { useSiteData } from "@/hooks/useSiteData";
import Captcha from "@/components/Captcha";
import toast from "react-hot-toast";

const PageContact: FC = () => {
  const { siteData, loading: siteLoading } = useSiteData();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    captcha_answer: "",
    captcha_token: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);

  const contactInfo = siteData?.settings?.contact;
  const socialLinks = siteData?.settings?.social || {};

  const info = [
    {
      title: "🗺 ADDRESS",
      desc: contactInfo?.address || "Not provided",
    },
    {
      title: "💌 EMAIL",
      desc: contactInfo?.email || "Not provided",
    },
    {
      title: "☎ PHONE",
      desc: contactInfo?.phone || "Not provided",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaValid) {
      toast.error("Please solve the captcha correctly");
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          captcha_answer: parseInt(formData.captcha_answer),
          captcha_token: formData.captcha_token,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Message sent successfully!");
        setFormData({
          name: "",
          email: "",
          message: "",
          captcha_answer: "",
          captcha_token: "",
        });
        setCaptchaValid(false);
        setCaptchaRefreshKey(prev => prev + 1); // Refresh captcha
      } else {
        toast.error(data.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`nc-PageContact overflow-hidden`}>
      <div className="">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          Contact
        </h2>
        <div className="container max-w-7xl mx-auto">
          <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-12 ">
            <div className="max-w-sm space-y-8">
              {siteLoading ? (
                <div className="space-y-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-32 mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-48"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {info.map((item, index) => (
                    <div key={index}>
                      <h3 className="uppercase font-semibold text-sm dark:text-neutral-200 tracking-wider">
                        {item.title}
                      </h3>
                      <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
                        {item.desc}
                      </span>
                    </div>
                  ))}
                  <div>
                    <h3 className="uppercase font-semibold text-sm dark:text-neutral-200 tracking-wider">
                      🌏 SOCIALS
                    </h3>
                    <SocialsList className="mt-2" socialLinks={socialLinks} />
                  </div>
                </>
              )}
            </div>
            <div>
              <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
                <label className="block">
                  <Label>Full name <span className="text-error">*</span></Label>
                  <Input
                    placeholder="Example Doe"
                    type="text"
                    className="mt-1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </label>
                <label className="block">
                  <Label>Email address <span className="text-error">*</span></Label>
                  <Input
                    type="email"
                    placeholder="example@example.com"
                    className="mt-1"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </label>
                <label className="block">
                  <Label>Message <span className="text-error">*</span></Label>
                  <Textarea
                    className="mt-1"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </label>
                <Captcha 
                  onVerify={setCaptchaValid}
                  onAnswerChange={(answer, token) => {
                    setFormData({ 
                      ...formData, 
                      captcha_answer: answer,
                      captcha_token: token 
                    });
                  }}
                  refreshKey={captchaRefreshKey}
                />
                <div>
                  <ButtonPrimary type="submit" disabled={isSubmitting || !captchaValid}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* OTHER SECTIONS */}
      <div className="container">
        <div className="relative my-24 lg:my-32 py-24 lg:py-32">
          <BackgroundSection />
        </div>
      </div>
    </div>
  );
};

export default PageContact;
