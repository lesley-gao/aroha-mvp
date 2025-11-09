import type { Locale } from '@/i18n/messages';

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const translations = {
    en: {
      footerMessage: "You're not alone on this journey. Every step counts. 🌅",
      footerDisclaimer: "This tool is for self-monitoring only. If you're in crisis, please call 1737 for support.",
    },
    mi: {
      footerMessage: "Ehara koe i te takitahi. Ko ia hipanga he mea nui. 🌅",
      footerDisclaimer: "Mō te aroturuki whaiaro anake. Mēnā kei te ohotata koe, waea mai ki te 1737.",
    }
  };

  const t = translations[locale];

  return (
    <footer className="p-8 border-t border-gray-200 bg-white/30">
      <div className="text-center p-0 m-0">
        <div className="flex items-center justify-center gap-2 mb-0">
          <span className="text-3xl">💚</span>
          <p className="text-gray-600 text-lg">{t.footerMessage}</p>
        </div>

        <p className=" text-gray-400 mb-0 max-w-xl mx-auto">
          {t.footerDisclaimer}
        </p>

        <p className=" text-gray-500 mb-0">
          © 2025 Aroha • Made with love in Aotearoa 🇳🇿
        </p>
      </div>
    </footer>
  );
}

