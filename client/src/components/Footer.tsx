import { Link } from "wouter";
import { Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-montserrat font-bold mb-4">
              РосПроизводство
            </h3>
            <p className="text-gray-400 mb-4">
              Платформа для объединения российских производств и клиентов
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Платформа</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-white transition-colors">
                  Поиск заказов
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-gray-400 hover:text-white transition-colors">
                  Компании
                </Link>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                  Тарифы
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Аналитика
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Поддержка</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Центр помощи
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Документация
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Обратная связь
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Контакты
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a 
                  href="mailto:support@rosproizvodstvo.ru" 
                  className="hover:text-white transition-colors"
                >
                  support@rosproizvodstvo.ru
                </a>
              </li>
              <li>
                <a 
                  href="tel:+74951234567" 
                  className="hover:text-white transition-colors"
                >
                  +7 (495) 123-45-67
                </a>
              </li>
              <li>Москва, ул. Примерная, 123</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 РосПроизводство. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
