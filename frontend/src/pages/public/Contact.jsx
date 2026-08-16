import { useI18n } from "@/lib/i18n";

export default function Contact() {
  const { t } = useI18n();
  const [titleA, titleB] = String(t("contact.title")).split("|");
  return (
    <div data-testid="public-contact" className="min-h-screen text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20">
        <div>
          <p className="label-eyebrow text-or mb-6">{t("contact.eyebrow")}</p>
          <h1 className="serif-display text-5xl lg:text-7xl mb-12">
            {titleA}<br />
            <span className="italic">{titleB}</span>
          </h1>
          <div className="space-y-8 text-lg">
            <div>
              <p className="label-eyebrow opacity-60 mb-2">{t("contact.general")}</p>
              <p>contact@cookandfood.gala</p>
            </div>
            <div>
              <p className="label-eyebrow opacity-60 mb-2">{t("contact.press")}</p>
              <p>press@cookandfood.gala</p>
            </div>
            <div>
              <p className="label-eyebrow opacity-60 mb-2">{t("contact.sponsoring")}</p>
              <p>partners@cookandfood.gala</p>
            </div>
            <div>
              <p className="label-eyebrow opacity-60 mb-2">{t("contact.phone")}</p>
              <p>+596 696 00 00 00</p>
            </div>
          </div>
        </div>
        <div className="lg:pt-20">
          <p className="label-eyebrow text-or mb-4">{t("contact.address_label")}</p>
          <p className="serif-display text-3xl leading-tight">
            CVLN Holding<br />
            Martinique · France
          </p>
          <p className="mt-10 text-sable text-sm italic opacity-70 max-w-md leading-relaxed">{t("contact.note")}</p>
        </div>
      </div>
    </div>
  );
}
