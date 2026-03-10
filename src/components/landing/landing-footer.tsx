import { PartyPopper, ExternalLink } from 'lucide-react';
import { HOTMART_40_CREDITS_URL, HOTMART_200_CREDITS_URL } from '@/lib/config';

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-pink-500 p-2 rounded-xl">
                <PartyPopper className="text-white w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold">
                Festa <span className="text-pink-400">Mágica</span>
              </h2>
            </div>
            <p className="text-gray-400 text-sm md:text-base max-w-sm">
              Transformando fotos em convites mágicos com inteligência artificial. 
              Crie festas inesquecíveis para seus pequenos.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href={HOTMART_40_CREDITS_URL} 
                  className="text-gray-400 hover:text-pink-400 transition-colors text-sm md:text-base inline-flex items-center gap-1"
                >
                  Comprar 40 créditos <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href={HOTMART_200_CREDITS_URL} 
                  className="text-gray-400 hover:text-pink-400 transition-colors text-sm md:text-base inline-flex items-center gap-1"
                >
                  Comprar 200 créditos <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="/entrar" 
                  className="text-gray-400 hover:text-pink-400 transition-colors text-sm md:text-base"
                >
                  Entrar / Criar conta
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 md:pt-8 text-center">
          <p className="text-gray-500 text-xs md:text-sm">
            © {new Date().getFullYear()} Festa Mágica. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
