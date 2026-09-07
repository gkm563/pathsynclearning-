import {
  LegalArticle,
  type LegalSection,
} from "@/components/marketing/MarketingChrome";

const SECTIONS: readonly LegalSection[] = [
  {
    title: "What Are Cookies",
    blocks: [
      {
        kind: "p",
        text: "As is common practice with almost all professional websites, PathEd uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it, and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break' certain elements of the site's functionality.",
      },
    ],
  },
  {
    title: "How We Use Cookies",
    blocks: [
      {
        kind: "p",
        text: "We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.",
      },
      {
        kind: "list",
        items: [
          {
            term: "Account related cookies:",
            text: "If you create an account with us, then we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out, but in some cases, they may remain afterwards to remember your site preferences when logged out.",
          },
          {
            term: "Login related cookies:",
            text: "We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.",
          },
          {
            term: "Site preferences cookies:",
            text: "In order to provide you with a great experience on this site, we provide the functionality to set your preferences for how this site runs when you use it (e.g., Dark Mode toggles).",
          },
        ],
      },
    ],
  },
  {
    title: "Disabling Cookies",
    blocks: [
      {
        kind: "p",
        text: "You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site (such as remaining logged in during coding challenges). Therefore it is recommended that you do not disable cookies.",
      },
    ],
  },
  {
    title: "Third-Party Cookies",
    blocks: [
      {
        kind: "p",
        text: "In some special cases, we also use cookies provided by trusted third parties. For example, PathEd uses analytics solutions to help us understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.",
      },
    ],
  },
];

export default function CookiePolicy() {
  return (
    <LegalArticle
      title="Cookie Policy"
      updated="July 20, 2026"
      summary="What cookies PathEd stores on your device, why each one exists, and how to turn them off if you would rather we didn't."
      sections={SECTIONS}
    />
  );
}
