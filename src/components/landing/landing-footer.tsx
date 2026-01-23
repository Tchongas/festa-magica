import Link from 'next/link';
import { PartyPopper, Mail, Instagram } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-pink-500 p-2 rounded-xl">
                <PartyPopper className="text-white w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">
                Festa <span className="text-pink-400">Mágica</span>
              </h2>
            </div>
            <p className="text-gray-400 max-w-sm">
              Transformando fotos em convites mágicos com inteligência artificial. 
              Crie festas inesquecíveis para seus pequenos.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#como-funciona" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#precos" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Entrar
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Criar Conta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/termos" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Privacidade
                </Link>
              </li>
            </ul>

            <h3 className="font-bold text-lg mt-6 mb-4">Contato</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:contato@festamagica.com.br" className="text-gray-400 hover:text-pink-400 transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </a>
              </li>
              <li>
                <a href="https://instagram.com/festamagica" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400 transition-colors flex items-center gap-2">
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Festa Mágica. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
