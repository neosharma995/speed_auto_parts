<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class CatalogTranslationsSeeder extends Seeder
{
    public function run(): void
    {
        $categoryTranslations = [
            'tires' => [
                'ar' => [
                    'name' => 'الإطارات',
                    'description' => 'إطارات عالية الأداء للطرق والحلبات مصممة لأقصى ثبات ومتانة.',
                ],
                'fr' => [
                    'name' => 'Pneus',
                    'description' => 'Pneus haute performance route et piste conçus pour une adhérence et une longévité maximales.',
                ],
            ],
            'brakes' => [
                'ar' => [
                    'name' => 'الفرامل',
                    'description' => 'أقراص فرامل مثقبة ومشقوقة، بطانات سيراميك وملاقط عالية الأداء.',
                ],
                'fr' => [
                    'name' => 'Freins',
                    'description' => 'Disques de frein percés et rainurés, plaquettes céramique et étriers haute performance.',
                ],
            ],
            'intake' => [
                'ar' => [
                    'name' => 'سحب الهواء',
                    'description' => 'أنظمة سحب هواء بارد وفلاتر عالية التدفق لزيادة القوة الحصانية واستجابة المحرك.',
                ],
                'fr' => [
                    'name' => 'Admission',
                    'description' => "Systèmes d'admission d'air froid et filtres haut débit pour plus de puissance et de réactivité.",
                ],
            ],
            'exhaust' => [
                'ar' => [
                    'name' => 'العادم',
                    'description' => 'أنظمة عادم رياضية من الفولاذ المقاوم للصدأ بصوت عميق وأداء متفوق.',
                ],
                'fr' => [
                    'name' => 'Échappement',
                    'description' => "Systèmes d'échappement sport en acier inoxydable au son profond et performant.",
                ],
            ],
            'suspension' => [
                'ar' => [
                    'name' => 'نظام التعليق',
                    'description' => 'أطقم تعليق رياضي قابلة للتعديل للتحكم الدقيق والثبات على المنعطفات.',
                ],
                'fr' => [
                    'name' => 'Suspension',
                    'description' => 'Kits combinés filetés réglables pour une tenue de route et une précision optimales.',
                ],
            ],
            'engine' => [
                'ar' => [
                    'name' => 'المحرك',
                    'description' => 'قطع غيار محركات رياضية عالية التحمل لتعزيز القوة والموثوقية.',
                ],
                'fr' => [
                    'name' => 'Moteur',
                    'description' => 'Pièces moteur haute performance conçues pour la puissance et la fiabilité.',
                ],
            ],
            'cooling' => [
                'ar' => [
                    'name' => 'التبريد',
                    'description' => 'مبردات ألمنيوم ومراوح عالية الكفاءة للحفاظ على حرارة المحرك المثالية.',
                ],
                'fr' => [
                    'name' => 'Refroidissement',
                    'description' => 'Radiateurs aluminium et ventilateurs haute capacité pour un refroidissement optimal.',
                ],
            ],
            'lighting' => [
                'ar' => [
                    'name' => 'الإضاءة',
                    'description' => 'مصابيح LED وزينون عالية السطوع لرؤية ليلية واضحة وآمنة.',
                ],
                'fr' => [
                    'name' => 'Éclairage',
                    'description' => 'Phares LED et xénon haute intensité pour une visibilité nocturne optimale.',
                ],
            ],
        ];

        Category::query()->each(function (Category $category) use ($categoryTranslations): void {
            if (isset($categoryTranslations[$category->slug])) {
                $category->update(['translations' => $categoryTranslations[$category->slug]]);
                return;
            }

            $existing = is_array($category->translations) ? $category->translations : [];
            $category->update([
                'translations' => [
                    'ar' => [
                        'name' => $existing['ar']['name'] ?? "قطع {$category->name} الرياضية",
                        'description' => $existing['ar']['description'] ?? "تشكيلة مختارة من قطع غيار {$category->name} عالية الأداء والمعتمدة.",
                    ],
                    'fr' => [
                        'name' => $existing['fr']['name'] ?? $category->name,
                        'description' => $existing['fr']['description'] ?? "Pièces détachées haute performance pour {$category->name}.",
                    ],
                ],
            ]);
        });

        $brandTranslations = [
            'brembo' => [
                'ar' => ['name' => 'بريمبو', 'description' => 'الشركة الإيطالية الرائدة عالمياً في أنظمة المكابح الرياضية.'],
                'fr' => ['name' => 'Brembo', 'description' => 'Leader mondial italien des systèmes de freinage haute performance.'],
            ],
            'michelin' => [
                'ar' => ['name' => 'ميشلان', 'description' => 'إطارات فرنسية فائقة الأداء بتقنية سباقات السيارات.'],
                'fr' => ['name' => 'Michelin', 'description' => 'Pneus français haute performance issus de la compétition automobile.'],
            ],
            'borla' => [
                'ar' => ['name' => 'بورلا', 'description' => 'أنظمة عادم رياضية من الفولاذ المقاوم للصدأ T-304.'],
                'fr' => ['name' => 'Borla', 'description' => "Systèmes d'échappement sport en acier inoxydable T-304."],
            ],
            'kn-engineering' => [
                'ar' => ['name' => 'كيه آند إن', 'description' => 'فلاتر هواء عالية التدفق وأنظمة سحب هواء بارد قابلة لإعادة الاستخدام.'],
                'fr' => ['name' => 'K&N Engineering', 'description' => "Filtres à air haut débit lavables et admissions d'air froid."],
            ],
            'bilstein' => [
                'ar' => ['name' => 'بيلشتاين', 'description' => 'تكنولوجيا تعليق ألمانية دقيقة لثبات فائق على الطرق والحلبات.'],
                'fr' => ['name' => 'Bilstein', 'description' => 'Technologie de suspension allemande de précision pour route et circuit.'],
            ],
            'garrett-motion' => [
                'ar' => ['name' => 'غاريت موشن', 'description' => 'شواحن توربينية متطورة للأداء العالي والسباقات.'],
                'fr' => ['name' => 'Garrett Motion', 'description' => 'Turbocompresseurs avancés pour la performance et le sport automobile.'],
            ],
            'akrapovic' => [
                'ar' => ['name' => 'أكرابوفيتش', 'description' => 'أنظمة عادم فاخرة من التيتانيوم وألياف الكربون.'],
                'fr' => ['name' => 'Akrapovič', 'description' => "Systèmes d'échappement haut de gamme en titane et fibre de carbone."],
            ],
            'bbs-wheels' => [
                'ar' => ['name' => 'بي بي إس', 'description' => 'جنوط رياضية مطروقة خفيفة الوزن بتصميم ألماني أصيل.'],
                'fr' => ['name' => 'BBS Wheels', 'description' => 'Jantes forgées légères issues de l’ingénierie allemande.'],
            ],
        ];

        Brand::query()->each(function (Brand $brand) use ($brandTranslations): void {
            if (isset($brandTranslations[$brand->slug])) {
                $brand->update(['translations' => $brandTranslations[$brand->slug]]);
                return;
            }

            $existing = is_array($brand->translations) ? $brand->translations : [];
            $brand->update([
                'translations' => [
                    'ar' => [
                        'name' => $existing['ar']['name'] ?? $brand->name,
                        'description' => $existing['ar']['description'] ?? 'شركة مصنعة معتمدة لقطع الغيار الرياضية عالية الجودة.',
                    ],
                    'fr' => [
                        'name' => $existing['fr']['name'] ?? $brand->name,
                        'description' => $existing['fr']['description'] ?? 'Fabricant certifié de pièces automobiles haute performance.',
                    ],
                ],
            ]);
        });

        $productTranslations = [
            'pilot-sport-5-performance-tire' => [
                'ar' => [
                    'name' => 'إطار بايلوت سبورت 5 عالي الأداء',
                    'short_description' => 'إطار رياضي عالي الأداء لأقصى درجات الثبات والتحكم.',
                    'description' => 'مصمم لقيادة رياضية دقيقة مع ثبات فائق على الطرق الجافة والمبللة وعمر افتراضي أطول.',
                    'technical_specifications' => 'مؤشر التآكل: 300 | التماسك: AA | الحرارة: A | تصنيف السرعة: (Y) >300 كم/س | المنشأ: فرنسا',
                ],
                'fr' => [
                    'name' => 'Pneu Performance Pilot Sport 5',
                    'short_description' => 'Pneu haute performance pour une adhérence et un contrôle maximaux.',
                    'description' => 'Conçu pour une conduite sportive précise avec une adhérence exceptionnelle sur sol sec et mouillé.',
                    'technical_specifications' => 'Treadwear : 300 | Traction : AA | Température : A | Indice vitesse : (Y) >300 km/h | Origine : France',
                ],
            ],
            'slotted-drilled-brake-rotor' => [
                'ar' => [
                    'name' => 'قرص فرامل مشقوق ومثقب رياضي',
                    'short_description' => 'قوة كبح معززة وتبديد حرارة فائق الأداء.',
                    'description' => 'أقراص فرامل مهواة عالية الكربون لتقليل التآكل الحراري ومنح استجابة كبح فورية.',
                    'technical_specifications' => 'المادة: سبيكة حديد عالية الكربون G3000 | التشطيب: طلاء زنك مقاوم للصدأ | التبريد: مهوى ومشقوق',
                ],
                'fr' => [
                    'name' => 'Disque de Frein Percé & Rainuré',
                    'short_description' => 'Puissance de freinage améliorée et dissipation thermique optimale.',
                    'description' => 'Disques de frein haute teneur en carbone réduisant le fading thermique pour un freinage constant.',
                    'technical_specifications' => 'Matériau : Fonte haute teneur en carbone G3000 | Finition : Zingage anticorrosion | Type : Ventilé percé/rainuré',
                ],
            ],
            'performance-cat-back-exhaust' => [
                'ar' => [
                    'name' => 'نظام عادم كات-باك رياضي',
                    'short_description' => 'نظام من الفولاذ المقاوم للصدأ بصوت عميق ورياضي.',
                    'description' => 'مصنوع من فولاذ T-304 المقاوم للصدأ لزيادة تدفق العادم وتحسين القوة الحصانية وصوت المحرك.',
                    'technical_specifications' => 'المادة: فولاذ T-304 مقاوم للصدأ | قطر الأنبوب: 3 بوصة | اللحام: TIG عالي الدقة | زيادة متوقعة: +18 حصان',
                ],
                'fr' => [
                    'name' => 'Échappement Sport Cat-Back',
                    'short_description' => 'Système en acier inoxydable au son profond et agressif.',
                    'description' => 'Fabriqué en acier inoxydable T-304 pour maximiser le flux des gaz et libérer la puissance moteur.',
                    'technical_specifications' => 'Matériau : Acier inoxydable T-304 | Diamètre : 3 pouces | Soudure : TIG | Gain estimé : +18 ch',
                ],
            ],
            'cold-air-intake-system' => [
                'ar' => [
                    'name' => 'نظام سحب هواء بارد رياضي',
                    'short_description' => 'يزيد القوة الحصانية واستجابة دواسة الوقود.',
                    'description' => 'أنبوب سحب ألمنيوم مصقول مع فلتر هواء عالي التدفق لتوصيل هواء بارد وكثيف إلى المحرك.',
                    'technical_specifications' => 'وسيط الفلتر: شاش قطني مزيت قابل للغسل | الأنبوب: ألمنيوم مطلي مقاس 3.5 بوصة | الزيادة المقدرة: +14.2 حصان عند 5800 دورة/دقيقة',
                ],
                'fr' => [
                    'name' => "Système d'Admission d'Air Froid",
                    'short_description' => "Augmente la puissance moteur et la réactivité de l'accélérateur.",
                    'description' => "Tubulure en aluminium poli avec filtre haut débit pour un apport d'air frais optimal.",
                    'technical_specifications' => 'Média filtrant : Gaze de coton huilée lavable | Tube : Aluminium thermolaqué 3,5" | Gain estimé : +14,2 ch à 5800 tr/min',
                ],
            ],
            'b16-pss10-coilover-suspension-kit' => [
                'ar' => [
                    'name' => 'طقم تعليق كويلوفر B16 PSS10 رياضي',
                    'short_description' => 'تخميد وارتفاع قابل للتعديل لدقة القيادة على الحلبات.',
                    'description' => 'نظام تعليق ألماني بعشر درجات تعديل للتخميد لضبط مثالي بين الراحة والأداء الرياضي.',
                    'technical_specifications' => 'التخميد: 10 مستويات قابلة للتعديل | خفض الارتفاع: 30-50 مم | التصميم: أحادي الأنبوب مقلوب | المنشأ: ألمانيا',
                ],
                'fr' => [
                    'name' => 'Kit Suspension Combinés Filetés B16 PSS10',
                    'short_description' => 'Amortissement et hauteur réglables pour une précision sur piste.',
                    'description' => 'Système de suspension allemand à 10 niveaux de réglage pour un équilibre parfait route et circuit.',
                    'technical_specifications' => 'Amortissement : 10 réglages | Rabaissement : 30-50 mm | Conception : Monotube inversé | Origine : Allemagne',
                ],
            ],
        ];

        Product::query()->each(function (Product $product) use ($productTranslations): void {
            if (isset($productTranslations[$product->slug])) {
                $product->update(['translations' => $productTranslations[$product->slug]]);
                return;
            }

            $product->update([
                'translations' => $this->translateDynamicProduct($product),
            ]);
        });
    }

    /**
     * Build natural Arabic & French translations for any dynamically created or imported product.
     */
    private function translateDynamicProduct(Product $product): array
    {
        $name = (string) $product->name;

        if (preg_match('/^Forged Aluminum Control Arm\s*(.*)$/i', $name, $m)) {
            $suffix = trim($m[1] ?? '');
            return [
                'ar' => [
                    'name' => trim("ذراع تحكم ألمنيوم مطروق {$suffix}"),
                    'short_description' => 'ذراع تحكم رياضي خفيف الوزن من الألمنيوم المطروق لثبات فائق.',
                    'description' => 'مصمم بدقة من الألمنيوم المطروق عالي القوة لتحسين توجيه المركبة وتقليل الوزن غير المعلق.',
                ],
                'fr' => [
                    'name' => trim("Bras de Suspension en Aluminium Forgé {$suffix}"),
                    'short_description' => 'Bras de suspension léger en aluminium forgé pour une précision accrue.',
                    'description' => 'Usiné en aluminium forgé haute résistance pour améliorer la tenue de route et la durabilité.',
                ],
            ];
        }

        if (preg_match('/^Multi Lot Part\s+([A-Z])\s*(.*)$/i', $name, $m)) {
            $series = strtoupper($m[1] ?? '');
            $suffix = trim($m[2] ?? '');
            return [
                'ar' => [
                    'name' => trim("قطعة أداء رياضية فئة {$series} {$suffix}"),
                    'short_description' => 'قطعة غيار أصلية عالية الأداء معتمدة ومختبرة للجودة.',
                    'description' => 'مكون هندسي عالي الدقة متوافق مع أنظمة الأداء الرياضي ومصمم للتحمل الطويل.',
                ],
                'fr' => [
                    'name' => trim("Pièce Performance Série {$series} {$suffix}"),
                    'short_description' => 'Pièce détachée haute performance certifiée et contrôlée en qualité.',
                    'description' => 'Composant automobile de précision conçu pour la fiabilité et les performances sportives.',
                ],
            ];
        }

        return [
            'ar' => [
                'name' => $name,
                'short_description' => 'قطعة غيار سيارات رياضية عالية الأداء بجودة أصلية معتمدة.',
                'description' => 'مصممة بدقة هندسية فائقة لتوفير أفضل أداء وثبات وموثوقية لمركبتك.',
            ],
            'fr' => [
                'name' => $name,
                'short_description' => 'Pièce automobile haute performance certifiée qualité OEM.',
                'description' => 'Conçue avec une ingénierie de précision pour offrir des performances et une fiabilité optimales.',
            ],
        ];
    }
}
