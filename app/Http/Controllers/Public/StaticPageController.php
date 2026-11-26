<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaticPageController extends Controller
{
    public function categories(): Response
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Public/Categories', [
            'categories' => $categories,
        ]);
    }

    public function brands(): Response
    {
        $brands = Brand::query()
            ->where('is_active', true)
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return Inertia::render('Public/Brands', [
            'brands' => $brands,
        ]);
    }

    public function trackOrder(): Response
    {
        return Inertia::render('Public/TrackOrder');
    }

    public function trackOrderApi(Request $request): JsonResponse
    {
        $orderNumber = trim((string) $request->query('order_number'));

        if (empty($orderNumber)) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid order number.',
            ], 422);
        }

        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with(['items'])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => "Order #{$orderNumber} was not found. Please verify the order number on your invoice.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'order' => [
                'order_number' => $order->order_number,
                'status' => $order->delivery_status,
                'payment_status' => $order->payment_status,
                'delivery_status' => $order->delivery_status,
                'tracking_number' => $order->tracking_number,
                'tracking_url' => $order->tracking_url,
                'carrier' => $order->tracking_carrier,
                'total_amount' => $order->total_amount,
                'shipping_city' => $order->city,
                'shipping_state' => $order->state,
                'created_at' => $order->created_at->format('M d, Y h:i A'),
                'items_count' => $order->items->count(),
            ],
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'About SPEED AUTOS PARTS',
            'subtitle' => 'Specialized automotive engineering spares & motorsport hardware distribution.',
            'content' => "Welcome to SPEED AUTOS PARTS — your dedicated supplier for high-performance automotive replacement components, precision braking systems, high-flow induction setups, mandrel-bent exhausts, and track-grade suspension kits.\n\nFounded by passionate automotive engineers and drivers, SPEED AUTOS PARTS bridges the gap between precision track performance and everyday street reliability. Every single component in our catalog is engineered to exacting tolerances, 100% genuine guaranteed, and backed by comprehensive vehicle compatibility databases.\n\nWhether you're executing a weekend garage build, upgrading track day brakes, or replacing critical OEM components, SPEED AUTOS PARTS delivers verified fitment and fast nationwide distribution.",
            'translations' => [
                'ar' => [
                    'title' => 'عن سبيد أوتو بارتس',
                    'subtitle' => 'توزيع متخصص لقطع غيار السيارات الرياضية ومعدات الأداء العالي.',
                    'content' => "مرحباً بكم في سبيد أوتو بارتس — موردكم المتخصص لقطع الغيار الرياضية عالية الأداء، أنظمة المكابح الدقيقة، أنظمة سحب الهواء عالية التدفق، أنظمة العادم الرياضية، وأطقم التعليق المخصصة للحلبات.\n\nتأسست سبيد أوتو بارتس على يد مهندسي سيارات وسائقين شغوفين لردم الفجوة بين أداء الحلبات الدقيق وموثوقية القيادة اليومية. كل قطعة في كتالوجنا أصلية 100% ومضمونة ومدعومة بقاعدة بيانات شاملة لتوافق المركبات.\n\nسواء كنت تنفذ مشروع تعديل في الكراج، أو ترقي فرامل الحلبات، أو تستبدل قطع غيار أصلية أساسية، نوفر لك التوافق المضمون والتوصيل السريع.",
                ],
                'fr' => [
                    'title' => 'À propos de SPEED AUTOS PARTS',
                    'subtitle' => 'Distribution spécialisée de pièces automobiles haute performance et équipement motorsport.',
                    'content' => "Bienvenue chez SPEED AUTOS PARTS — votre fournisseur dédié de pièces automobiles haute performance : systèmes de freinage de précision, admissions haut débit, échappements sport et kits combinés filetés.\n\nFondée par des ingénieurs et pilotes passionnés, SPEED AUTOS PARTS allie performance sur piste et fiabilité quotidienne. Chaque pièce de notre catalogue est 100% d'origine, garantie et vérifiée grâce à notre base de compatibilité véhicules.\n\nQue vous prépariez un projet garage, amélioriez votre freinage piste ou remplaciez des pièces OEM essentielles, nous assurons une compatibilité vérifiée et une livraison rapide.",
                ],
            ],
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'Contact Engineering Support',
            'subtitle' => 'Have questions regarding vehicle fitment or part numbers? Our Dubai technical specialists are here to assist.',
            'content' => "Our team of certified automotive mechanics and performance specialists is available Monday through Saturday, 9:00 AM – 7:00 PM GST (Dubai Time).\n\nDirect Inquiries:\n• Support Hotline: +971 4 512 8900\n• Technical Fitment Desk: support@speedautosparts.ae\n• Dubai HQ & Warehouse: SPEED AUTOS PARTS Logistics Hub, Al Quoz Industrial Area 3, Dubai, United Arab Emirates\n\nFor part number verification, please include your 17-digit VIN (Vehicle Identification Number), Engine Code, and Year/Make/Model in your inquiry.",
            'translations' => [
                'ar' => [
                    'title' => 'تواصل مع الدعم الفني والهندسي',
                    'subtitle' => 'هل لديك استفسار حول توافق المركبات أو أرقام القطع؟ خبراؤنا التقنيون في دبي جاهزون لمساعدتك.',
                    'content' => "فريقنا من الميكانيكيين المعتمدين وخبراء الأداء متاح من الإثنين إلى السبت، من 9:00 صباحاً حتى 7:00 مساءً بتوقيت دبي.\n\nللتواصل المباشر:\n• خط الدعم الساخن: +971 4 512 8900\n• مكتب التوافق الفني: support@speedautosparts.ae\n• المقر الرئيسي والمستودع في دبي: مركز سبيد أوتو بارتس اللوجستي، منطقة القوز الصناعية 3، دبي، الإمارات العربية المتحدة\n\nللتحقق من رقم القطعة، يرجى تزويدنا برقم الهيكل (VIN) المكون من 17 خانة ورمز المحرك وسنة الصنع والشركة والموديل.",
                ],
                'fr' => [
                    'title' => 'Contacter le Support Technique',
                    'subtitle' => 'Des questions sur la compatibilité véhicule ou les références ? Nos spécialistes techniques à Dubaï sont à votre écoute.',
                    'content' => "Notre équipe de mécaniciens certifiés et de spécialistes performance est disponible du lundi au samedi, de 9h00 à 19h00 (heure de Dubaï / GST).\n\nContacts directs :\n• Ligne d'assistance : +971 4 512 8900\n• Bureau compatibilité technique : support@speedautosparts.ae\n• Siège & Entrepôt Dubaï : SPEED AUTOS PARTS Logistics Hub, Al Quoz Industrial Area 3, Dubaï, Émirats arabes unis\n\nPour vérifier une référence, merci d'indiquer votre numéro VIN à 17 caractères, le code moteur ainsi que l'année, la marque et le modèle.",
                ],
            ],
        ]);
    }

    public function shippingPolicy(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'Shipping & Dispatch Policy',
            'subtitle' => 'Fast UAE delivery and insured GCC freight for heavy automotive hardware.',
            'content' => "Fast & Reliable Dubai & UAE Dispatch:\n\n• Processing Time: In-stock components are inspected, packed with reinforced padding, and dispatched within 24 hours from our Al Quoz, Dubai warehouse.\n• Same-Day & Next-Day Dubai Delivery: Same-day courier dispatch across Dubai for orders placed before 2:00 PM GST; next-day delivery across Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain.\n• GCC & International Air Express: 2 to 4 business days across Saudi Arabia, Qatar, Kuwait, Bahrain, and Oman.\n• Heavy Freight Cargo: Oversized items such as cat-back exhaust systems, brake rotor assemblies, and coilover kits ship via Aramex Express and DHL Express UAE with full transit insurance.\n• Tracking: Once shipped, real-time AWB tracking details are sent via SMS and Email.",
            'translations' => [
                'ar' => [
                    'title' => 'سياسة الشحن والتوصيل',
                    'subtitle' => 'توصيل سريع داخل الإمارات وشحن مؤمّن لدول الخليج للقطع الثقيلة.',
                    'content' => "شحن سريع وموثوق من دبي إلى جميع أنحاء الإمارات والخليج:\n\n• مدة التجهيز: يتم فحص وتغليف القطع المتوفرة وشحنها خلال 24 ساعة من مستودعنا في القوز بدبي.\n• توصيل في نفس اليوم أو اليوم التالي داخل الإمارات: توصيل في نفس اليوم داخل دبي للطلبات قبل الساعة 2:00 ظهراً، وفي اليوم التالي لأبوظبي والشارقة وعجمان ورأس الخيمة والفجيرة وأم القيوين.\n• الشحن الجوي لدول الخليج والعالم: خلال 2 إلى 4 أيام عمل إلى السعودية وقطر والكويت والبحرين وعمان.\n• الشحن الثقيل: يتم شحن أنظمة العادم وأقراص الفرامل وأطقم التعليق عبر أرامكس وDHL مع تأمين شامل.\n• التتبع المباشر: يتم إرسال رقم التتبع فوراً عبر الرسائل النصية والبريد الإلكتروني.",
                ],
                'fr' => [
                    'title' => 'Politique de Livraison & Expédition',
                    'subtitle' => 'Livraison rapide aux EAU et fret assuré dans tout le CCG pour pièces lourdes.',
                    'content' => "Expédition rapide et fiable depuis Dubaï :\n\n• Préparation : Les pièces en stock sont contrôlées, emballées avec protection renforcée et expédiées sous 24h depuis notre entrepôt d'Al Quoz à Dubaï.\n• Livraison EAU : Expédition le jour même à Dubaï pour les commandes avant 14h00 GST ; livraison le lendemain à Abou Dabi, Sharjah, Ajman, Ras al-Khaïmah, Fujaïrah et Oumm al-Qaïwaïn.\n• Express CCG & International : 2 à 4 jours ouvrés vers l'Arabie saoudite, le Qatar, le Koweït, Bahreïn et Oman.\n• Fret lourd : Les échappements, disques et combinés filetés sont expédiés via Aramex Express et DHL Express avec assurance complète.\n• Suivi : Un numéro de suivi AWB en temps réel est envoyé par SMS et e-mail.",
                ],
            ],
        ]);
    }

    public function returnPolicy(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'Return & Refund Policy',
            'subtitle' => 'Hassle-free 30-day returns on uninstalled, verified automotive spares.',
            'content' => "Fitment Guarantee & Return Rules:\n\n• 30-Day Return Window: If a component is unopened, uninstalled, and in its original manufacturer packaging with all hardware intact, you may initiate a return within 30 days of delivery.\n• Fitment Guarantee: If an item verified through our Vehicle Parts Finder fails to fit your unmodified vehicle, we provide 100% free return pickup and replacement.\n• Non-Returnable Items: Electrical components (ECUs, wiring harnesses, opened sensors) and custom-drilled or mounted wheels/tires cannot be returned once test-fitted.\n• Refund Processing: Refunds are initiated within 48 hours of inspection at our Dubai warehouse back to your original Stripe payment card.",
            'translations' => [
                'ar' => [
                    'title' => 'سياسة الإرجاع والاسترداد',
                    'subtitle' => 'إرجاع سهل خلال 30 يوماً للقطع غير المركّبة والمعتمدة.',
                    'content' => "ضمان التوافق وقواعد الإرجاع:\n\n• مهلة الإرجاع 30 يوماً: يمكنك طلب إرجاع أي قطعة غير مفتوحة وغير مركّبة وبعبوتها الأصلية الكاملة خلال 30 يوماً من الاستلام.\n• ضمان التوافق 100%: إذا لم تتوافق أي قطعة تم التحقق منها عبر أداة البحث حسب المركبة مع سيارتك غير المعدّلة، نوفر استلاماً واستبدالاً مجانياً بالكامل.\n• القطع غير القابلة للإرجاع: القطع الكهربائية (وحدات ECU والحساسات المفتوحة) والجنوط أو الإطارات بعد التركيب.\n• استرداد المبالغ: تتم معالجة الاسترداد خلال 48 ساعة من الفحص في مستودع دبي إلى نفس بطاقة الدفع الأصلية.",
                ],
                'fr' => [
                    'title' => 'Politique de Retour & Remboursement',
                    'subtitle' => 'Retours simplifiés sous 30 jours sur les pièces non montées.',
                    'content' => "Garantie de compatibilité & règles de retour :\n\n• Délai de 30 jours : Toute pièce non ouverte, non montée et dans son emballage d'origine complet peut être retournée sous 30 jours.\n• Garantie de compatibilité : Si une pièce vérifiée via notre sélecteur de véhicule ne convient pas à votre véhicule d'origine, le retour et le remplacement sont 100% gratuits.\n• Articles non retournables : Composants électroniques ouverts (calculateurs, capteurs) et jantes/pneus déjà montés.\n• Remboursement : Traité sous 48h après inspection dans notre entrepôt de Dubaï vers votre carte de paiement d'origine.",
                ],
            ],
        ]);
    }

    public function privacyPolicy(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'Privacy Policy',
            'subtitle' => 'How SPEED AUTOS PARTS protects your vehicle details and account information.',
            'content' => "We value your privacy. We only collect essential customer data required to fulfill parts orders, calculate accurate UAE VAT (5%), verify vehicle fitment compatibility, and coordinate courier delivery.\n\nWe never sell or rent your personal information to third-party marketing brokers. All financial transactions are securely processed via 256-bit SSL encrypted channels directly through PCI-DSS Level 1 certified Stripe Checkout. Your credit card credentials are never stored on our servers.",
            'translations' => [
                'ar' => [
                    'title' => 'سياسة الخصوصية',
                    'subtitle' => 'كيف تحمي سبيد أوتو بارتس بيانات مركبتك ومعلومات حسابك.',
                    'content' => "نحن نقدر خصوصيتك. نجمع فقط البيانات الأساسية اللازمة لتنفيذ طلبات قطع الغيار، وحساب ضريبة القيمة المضافة بدقة (5%)، والتحقق من توافق المركبات، وتنسيق التوصيل.\n\nلا نقوم أبداً ببيع أو تأجير معلوماتك الشخصية لأي جهات تسويقية خارجية. تتم معالجة جميع المدفوعات عبر قنوات مشفرة بتقنية SSL 256-bit مباشرة عبر Stripe المعتمد وفق معيار PCI-DSS Level 1، ولا يتم حفظ بيانات بطاقتك على خوادمنا مطلقاً.",
                ],
                'fr' => [
                    'title' => 'Politique de Confidentialité',
                    'subtitle' => 'Comment SPEED AUTOS PARTS protège les informations de votre compte et de votre véhicule.',
                    'content' => "Nous respectons votre vie privée. Nous collectons uniquement les données nécessaires au traitement de vos commandes, au calcul exact de la TVA (5%), à la vérification de compatibilité et à la livraison.\n\nNous ne vendons ni ne louons jamais vos données personnelles. Toutes les transactions sont sécurisées par chiffrement SSL 256 bits via Stripe Checkout certifié PCI-DSS Niveau 1. Vos coordonnées bancaires ne sont jamais stockées sur nos serveurs.",
                ],
            ],
        ]);
    }

    public function terms(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'Terms of Service',
            'subtitle' => 'Guidelines and legal terms governing parts procurement and vehicle fitment.',
            'content' => "By accessing SPEED AUTOS PARTS and placing an order, you agree to our standard terms of service:\n\n1. Component Installation: Automotive hardware, especially brake components, suspension coilovers, and high-performance exhausts, should always be installed by certified automotive technicians following factory torque specifications.\n2. Vehicle Modifications: Fitment compatibility guarantees apply to stock, unmodified OEM chassis configurations unless explicitly noted for aftermarket configurations.\n3. Warranties: All manufacturer warranties are passed directly to the purchaser. SPEED AUTOS PARTS assists with RMA claims for certified defect inspections.",
            'translations' => [
                'ar' => [
                    'title' => 'الشروط والأحكام',
                    'subtitle' => 'الإرشادات والشروط القانونية التي تنظم شراء قطع الغيار وتوافق المركبات.',
                    'content' => "باستخدامك موقع سبيد أوتو بارتس وتقديم طلب شراء، فإنك توافق على شروط الخدمة التالية:\n\n1. تركيب القطع: يجب تركيب قطع الغيار—وخاصة أنظمة الفرامل والتعليق والعادم الرياضي—بواسطة فنيين معتمدين وفق مواصفات العزم القياسية للمصنع.\n2. تعديلات المركبة: تسري ضمانات التوافق على المركبات القياسية غير المعدلة ما لم يُذكر خلاف ذلك صراحةً.\n3. الضمانات: تنتقل جميع ضمانات الشركة المصنعة مباشرة للمشتري، ويساعد فريقنا في متابعة طلبات الضمان والفحص الفني.",
                ],
                'fr' => [
                    'title' => 'Conditions Générales de Vente',
                    'subtitle' => 'Conditions légales régissant l’achat de pièces et la compatibilité véhicule.',
                    'content' => "En utilisant SPEED AUTOS PARTS et en passant commande, vous acceptez nos conditions générales :\n\n1. Installation : Les pièces automobiles, notamment les freins, suspensions et échappements sport, doivent être installées par des techniciens certifiés selon les couples de serrage constructeur.\n2. Modifications : Les garanties de compatibilité s'appliquent aux véhicules d'origine non modifiés sauf mention contraire.\n3. Garanties : Toutes les garanties fabricant sont transmises directement à l'acheteur avec l'assistance de notre équipe pour tout dossier SAV.",
                ],
            ],
        ]);
    }

    public function helpCenter(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'Help Center',
            'subtitle' => 'Frequently needed support, order assistance, and fitment guidelines.',
            'content' => "Welcome to the Speed Autos Parts Dubai Help Center.\n\n• Ordering & Shipping: We deliver verified automotive hardware across Dubai, all UAE Emirates, and the GCC with real-time tracking.\n• Fitment Verification: Use our Vehicle Finder to confirm engine code, year, make, and model compatibility before placing orders.\n• Returns: Unopened and uninstalled parts can be returned within 30 days.\n• Technical Inquiries: Need advice on brake disc thickness, exhaust bore, or coilover spring rates? Reach our Dubai engineering team at support@speedautosparts.ae or call +971 4 512 8900.",
            'translations' => [
                'ar' => [
                    'title' => 'مركز المساعدة',
                    'subtitle' => 'الدعم السريع، مساعدة الطلبات، وإرشادات توافق قطع الغيار.',
                    'content' => "مرحباً بك في مركز مساعدة سبيد أوتو بارتس دبي.\n\n• الطلبات والشحن: نوصل قطع الغيار المعتمدة إلى دبي وكافة إمارات الدولة ودول الخليج مع تتبع فوري.\n• التحقق من التوافق: استخدم أداة البحث حسب المركبة لتأكيد توافق السنة والشركة والموديل والمحرك قبل الطلب.\n• الإرجاع: يمكن إرجاع القطع غير المفتوحة وغير المركّبة خلال 30 يوماً.\n• الاستفسارات الفنية: تواصل مع فريقنا الهندسي في دبي عبر support@speedautosparts.ae أو الاتصال على +971 4 512 8900.",
                ],
                'fr' => [
                    'title' => 'Centre d’Aide',
                    'subtitle' => 'Assistance commandes, livraison et conseils de compatibilité.',
                    'content' => "Bienvenue dans le Centre d'Aide Speed Autos Parts Dubaï.\n\n• Commandes & Livraison : Livraison rapide à Dubaï, dans tous les EAU et le CCG avec suivi en temps réel.\n• Compatibilité : Utilisez notre sélecteur de véhicule pour confirmer l'année, la marque, le modèle et la motorisation avant de commander.\n• Retours : Les pièces non ouvertes et non montées sont retournables sous 30 jours.\n• Support technique : Contactez nos ingénieurs à support@speedautosparts.ae ou au +971 4 512 8900.",
                ],
            ],
        ]);
    }

    public function faqs(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'Frequently Asked Questions (FAQs)',
            'subtitle' => 'Quick answers to common questions about parts, fitment, orders, and warranties.',
            'content' => "Frequently Asked Questions:\n\n1. How do I verify part compatibility?\nUse the Vehicle Parts Finder at the top of the store. Select your vehicle Year, Make, Model, and Engine to filter catalog parts guaranteed to fit.\n\n2. How long does shipping take?\nOrders are dispatched within 24–48 hours. Standard surface transit takes 3–5 business days, and express courier takes 1–2 business days.\n\n3. Can I return a part if it doesn't fit?\nYes! If verified via our Vehicle Parts Finder and it does not fit your unmodified vehicle, we provide 100% free return pickup and replacement.\n\n4. Are the parts genuine OEM or certified aftermarket?\nAll components sold on Speed Autos Parts are 100% authentic, sourced directly from certified manufacturers and authorized global distributors.",
            'translations' => [
                'ar' => [
                    'title' => 'الأسئلة الشائعة',
                    'subtitle' => 'إجابات سريعة على أكثر الأسئلة شيوعاً حول القطع والتوافق والطلبات والضمان.',
                    'content' => "الأسئلة الشائعة:\n\n1. كيف أتحقق من توافق القطعة مع سيارتي؟\nاستخدم أداة البحث حسب المركبة في أعلى المتجر واختر السنة والشركة والموديل والمحرك لعرض القطع المتوافقة فقط.\n\n2. كم يستغرق الشحن؟\nيتم شحن الطلبات خلال 24 إلى 48 ساعة، ويستغرق التوصيل السريع 1 إلى 2 يوم عمل داخل الإمارات و2 إلى 4 أيام لدول الخليج.\n\n3. هل يمكنني إرجاع القطعة إذا لم تتوافق؟\nنعم! إذا تم التحقق منها عبر أداة البحث حسب المركبة ولم تتوافق مع سيارتك القياسية، نوفر استلاماً واستبدالاً مجانياً 100%.\n\n4. هل القطع أصلية ومعتمدة؟\nجميع القطع المباعة على سبيد أوتو بارتس أصلية 100% ومن مصنّعين وموزعين عالميين معتمدين.",
                ],
                'fr' => [
                    'title' => 'Foire Aux Questions (FAQ)',
                    'subtitle' => 'Réponses rapides sur les pièces, la compatibilité, les commandes et les garanties.',
                    'content' => "Questions fréquentes :\n\n1. Comment vérifier la compatibilité d'une pièce ?\nUtilisez le sélecteur de véhicule en haut de la boutique en choisissant l'année, la marque, le modèle et le moteur.\n\n2. Quels sont les délais de livraison ?\nLes commandes sont expédiées sous 24 à 48h. La livraison express prend 1 à 2 jours ouvrés aux EAU et 2 à 4 jours dans le CCG.\n\n3. Puis-je retourner une pièce si elle ne convient pas ?\nOui ! Si elle a été vérifiée via notre sélecteur de véhicule pour un véhicule d'origine, le retour et l'échange sont 100% gratuits.\n\n4. Les pièces sont-elles d'origine ou certifiées ?\nToutes nos pièces sont 100% authentiques et proviennent directement des fabricants et distributeurs agréés.",
                ],
            ],
        ]);
    }

    public function notFound(): \Symfony\Component\HttpFoundation\Response
    {
        return Inertia::render('Public/NotFound')->toResponse(request())->setStatusCode(404);
    }
}
