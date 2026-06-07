export default function Contact() {
  return (
    <div data-testid="public-contact" className="min-h-screen text-ivoire px-6 lg:px-12 py-24">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20">
        <div>
          <p className="label-eyebrow text-or mb-6">Contact</p>
          <h1 className="serif-display text-5xl lg:text-7xl mb-12">
            Écrire<br />
            <span className="italic">à l'équipe.</span>
          </h1>
          <div className="space-y-8 text-lg">
            <div>
              <p className="label-eyebrow opacity-60 mb-2">Général</p>
              <p>contact@cookandfood.gala</p>
            </div>
            <div>
              <p className="label-eyebrow opacity-60 mb-2">Presse</p>
              <p>press@cookandfood.gala</p>
            </div>
            <div>
              <p className="label-eyebrow opacity-60 mb-2">Sponsoring</p>
              <p>partners@cookandfood.gala</p>
            </div>
            <div>
              <p className="label-eyebrow opacity-60 mb-2">Téléphone</p>
              <p>+596 696 00 00 00</p>
            </div>
          </div>
        </div>
        <div className="lg:pt-20">
          <p className="label-eyebrow text-or mb-4">Adresse postale</p>
          <p className="serif-display text-3xl leading-tight">
            CVLN Holding<br />
            Martinique · France
          </p>
          <p className="mt-10 text-sable text-sm italic opacity-70 max-w-md leading-relaxed">
            Pour toute demande de presse, merci d'inclure votre média et un délai de bouclage.
            Les demandes d'invitation passent uniquement par le formulaire RSVP VIP.
          </p>
        </div>
      </div>
    </div>
  );
}
