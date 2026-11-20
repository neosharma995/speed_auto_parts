<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use App\Models\ProductReview;
use App\Models\ProductVariation;
use App\Models\ProductVehicle;
use App\Models\TaxClass;
use App\Models\TaxRate;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AutomotiveCatalogSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Taxes
        $taxClassStandard = TaxClass::firstOrCreate(
            ['slug' => 'gst-18'],
            ['name' => 'Standard Auto Parts (GST 18%)', 'description' => 'Applicable to mechanical, intake & suspension parts', 'is_default' => true]
        );
        TaxRate::firstOrCreate(
            ['tax_class_id' => $taxClassStandard->id, 'country_code' => 'IN'],
            ['name' => 'GST 18% (9% CGST + 9% SGST)', 'rate' => 18.00, 'cgst_rate' => 9.00, 'sgst_rate' => 9.00, 'igst_rate' => 18.00, 'is_active' => true]
        );

        $taxClassHigh = TaxClass::firstOrCreate(
            ['slug' => 'gst-28'],
            ['name' => 'High Performance & Luxury Spares (GST 28%)', 'description' => 'Applicable to big brake kits and performance exhausts', 'is_default' => false]
        );
        TaxRate::firstOrCreate(
            ['tax_class_id' => $taxClassHigh->id, 'country_code' => 'IN'],
            ['name' => 'GST 28% (14% CGST + 14% SGST)', 'rate' => 28.00, 'cgst_rate' => 14.00, 'sgst_rate' => 14.00, 'igst_rate' => 28.00, 'is_active' => true]
        );

        // 2. Categories
        $categoriesData = [
            [
                'name' => 'Tires',
                'slug' => 'tires',
                'description' => 'Ultra high performance, street and track tires engineered for grip and longevity.',
                'image' => '/images/categories/tires.jpg',
                'icon' => 'Disc',
                'sort_order' => 1,
                'is_featured' => true,
            ],
            [
                'name' => 'Brakes',
                'slug' => 'brakes',
                'description' => 'Slotted and drilled rotors, carbon ceramic kits, racing calipers and performance pads.',
                'image' => '/images/categories/brakes.jpg',
                'icon' => 'ShieldAlert',
                'sort_order' => 2,
                'is_featured' => true,
            ],
            [
                'name' => 'Intake',
                'slug' => 'intake',
                'description' => 'Cold air intake systems, high-flow air filters, silicone piping, and intercoolers.',
                'image' => '/images/categories/intake.jpg',
                'icon' => 'Wind',
                'sort_order' => 3,
                'is_featured' => true,
            ],
            [
                'name' => 'Exhaust',
                'slug' => 'exhaust',
                'description' => 'T304 stainless steel cat-back exhaust systems, headers, downpipes and quad tips.',
                'image' => '/images/categories/exhaust.jpg',
                'icon' => 'Flame',
                'sort_order' => 4,
                'is_featured' => true,
            ],
            [
                'name' => 'Suspension',
                'slug' => 'suspension',
                'description' => 'Fully adjustable coilover kits, strut bars, lowering springs and anti-roll sway bars.',
                'image' => '/images/categories/suspension.jpg',
                'icon' => 'GitCommit',
                'sort_order' => 5,
                'is_featured' => true,
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $cData) {
            $categories[$cData['slug']] = Category::updateOrCreate(['slug' => $cData['slug']], $cData);
        }

        // 3. Brands
        $brandsData = [
            ['name' => 'Brembo', 'slug' => 'brembo', 'website' => 'https://www.brembo.com', 'description' => 'World leader in the design and production of high-performance braking systems.', 'is_featured' => true],
            ['name' => 'Michelin', 'slug' => 'michelin', 'website' => 'https://www.michelin.com', 'description' => 'Pioneering tire manufacturer engineered for track dominance and street comfort.', 'is_featured' => true],
            ['name' => 'Borla', 'slug' => 'borla', 'website' => 'https://www.borla.com', 'description' => 'Pioneers in the design and manufacture of stainless steel performance exhaust systems.', 'is_featured' => true],
            ['name' => 'K&N Engineering', 'slug' => 'kn-engineering', 'website' => 'https://www.knfilters.com', 'description' => 'The world’s leading manufacturer of washable performance air filters and intake systems.', 'is_featured' => true],
            ['name' => 'Bilstein', 'slug' => 'bilstein', 'website' => 'https://www.bilstein.com', 'description' => 'Legendary German suspension dampers, coilovers, and motorsport shock absorbers.', 'is_featured' => true],
            ['name' => 'Garrett Motion', 'slug' => 'garrett-motion', 'website' => 'https://www.garrettmotion.com', 'description' => 'Cutting-edge turbocharger aerodynamics and boost solutions for street and motorsport.', 'is_featured' => true],
            ['name' => 'Akrapovič', 'slug' => 'akrapovic', 'website' => 'https://www.akrapovic.com', 'description' => 'Premium titanium and carbon fiber exhaust systems engineered for motorsport.', 'is_featured' => true],
            ['name' => 'BBS Wheels', 'slug' => 'bbs-wheels', 'website' => 'https://bbs.com', 'description' => 'Iconic forged monoblock and modular aluminum racing wheels.', 'is_featured' => true],
        ];

        $brands = [];
        foreach ($brandsData as $bData) {
            $brands[$bData['slug']] = Brand::updateOrCreate(['slug' => $bData['slug']], $bData);
        }

        // 4. Vehicles
        $vehiclesData = [
            ['year' => 2024, 'make' => 'Ford', 'model' => 'Mustang GT', 'submodel' => 'Premium Fastback', 'engine' => '5.0L V8 Coyote', 'engine_size' => '5.0L', 'fuel_type' => 'Petrol', 'transmission' => '6-Speed Manual', 'body_type' => 'Coupe'],
            ['year' => 2024, 'make' => 'Ford', 'model' => 'Mustang GT', 'submodel' => 'Dark Horse', 'engine' => '5.0L V8 High Output', 'engine_size' => '5.0L', 'fuel_type' => 'Petrol', 'transmission' => '10-Speed Automatic', 'body_type' => 'Coupe'],
            ['year' => 2023, 'make' => 'BMW', 'model' => 'M3', 'submodel' => 'Competition xDrive', 'engine' => '3.0L Twin-Turbo S58', 'engine_size' => '3.0L', 'fuel_type' => 'Petrol', 'transmission' => '8-Speed M Steptronic', 'body_type' => 'Sedan'],
            ['year' => 2023, 'make' => 'BMW', 'model' => 'M4', 'submodel' => 'Competition', 'engine' => '3.0L Twin-Turbo S58', 'engine_size' => '3.0L', 'fuel_type' => 'Petrol', 'transmission' => '8-Speed M Steptronic', 'body_type' => 'Coupe'],
            ['year' => 2023, 'make' => 'Chevrolet', 'model' => 'Corvette Stingray', 'submodel' => '3LT Z51', 'engine' => '6.2L V8 LT2', 'engine_size' => '6.2L', 'fuel_type' => 'Petrol', 'transmission' => '8-Speed Dual-Clutch', 'body_type' => 'Coupe'],
            ['year' => 2022, 'make' => 'Honda', 'model' => 'Civic Type R', 'submodel' => 'FL5 Touring', 'engine' => '2.0L Turbo VTEC K20C1', 'engine_size' => '2.0L', 'fuel_type' => 'Petrol', 'transmission' => '6-Speed Manual', 'body_type' => 'Hatchback'],
            ['year' => 2023, 'make' => 'Subaru', 'model' => 'WRX', 'submodel' => 'GT Limited', 'engine' => '2.4L Turbo Boxer FA24', 'engine_size' => '2.4L', 'fuel_type' => 'Petrol', 'transmission' => '6-Speed Manual', 'body_type' => 'Sedan'],
            ['year' => 2023, 'make' => 'Toyota', 'model' => 'GR Supra', 'submodel' => '3.0 Premium', 'engine' => '3.0L Turbo Inline-6 B58', 'engine_size' => '3.0L', 'fuel_type' => 'Petrol', 'transmission' => '6-Speed Manual', 'body_type' => 'Coupe'],
            ['year' => 2022, 'make' => 'Porsche', 'model' => '911 Carrera S', 'submodel' => '992 Coupe', 'engine' => '3.0L Twin-Turbo Flat-6', 'engine_size' => '3.0L', 'fuel_type' => 'Petrol', 'transmission' => '8-Speed PDK', 'body_type' => 'Coupe'],
            ['year' => 2021, 'make' => 'Audi', 'model' => 'RS3', 'submodel' => 'Sportback', 'engine' => '2.5L Turbo Inline-5 EA855', 'engine_size' => '2.5L', 'fuel_type' => 'Petrol', 'transmission' => '7-Speed S Tronic', 'body_type' => 'Sedan'],
        ];

        $vehicles = [];
        foreach ($vehiclesData as $vData) {
            $vehicles[] = Vehicle::firstOrCreate([
                'year' => $vData['year'],
                'make' => $vData['make'],
                'model' => $vData['model'],
                'engine' => $vData['engine'],
            ], $vData);
        }

        // 5. Attributes
        $attrRim = ProductAttribute::firstOrCreate(['slug' => 'rim-diameter'], ['name' => 'Rim Diameter', 'description' => 'Wheel diameter in inches']);
        $attrWidth = ProductAttribute::firstOrCreate(['slug' => 'tire-width'], ['name' => 'Tire Width', 'description' => 'Section width in millimeters']);
        $attrPosition = ProductAttribute::firstOrCreate(['slug' => 'position'], ['name' => 'Axle Position', 'description' => 'Vehicle axle installation position']);
        $attrRotorDia = ProductAttribute::firstOrCreate(['slug' => 'rotor-diameter'], ['name' => 'Rotor Diameter', 'description' => 'Disc rotor diameter in millimeters']);
        $attrMaterial = ProductAttribute::firstOrCreate(['slug' => 'material'], ['name' => 'Construction Material', 'description' => 'Manufacturing material composition']);

        ProductAttributeValue::firstOrCreate(['attribute_id' => $attrRim->id, 'slug' => '18-inch'], ['value' => '18 Inch']);
        ProductAttributeValue::firstOrCreate(['attribute_id' => $attrRim->id, 'slug' => '19-inch'], ['value' => '19 Inch']);
        ProductAttributeValue::firstOrCreate(['attribute_id' => $attrWidth->id, 'slug' => '245mm'], ['value' => '245 mm']);
        ProductAttributeValue::firstOrCreate(['attribute_id' => $attrWidth->id, 'slug' => '275mm'], ['value' => '275 mm']);
        ProductAttributeValue::firstOrCreate(['attribute_id' => $attrPosition->id, 'slug' => 'front'], ['value' => 'Front Axle']);
        ProductAttributeValue::firstOrCreate(['attribute_id' => $attrPosition->id, 'slug' => 'rear'], ['value' => 'Rear Axle']);
        ProductAttributeValue::firstOrCreate(['attribute_id' => $attrRotorDia->id, 'slug' => '330mm'], ['value' => '330 mm']);
        ProductAttributeValue::firstOrCreate(['attribute_id' => $attrRotorDia->id, 'slug' => '355mm'], ['value' => '355 mm']);

        // 6. Products from prompt specifications
        // Product 1: Performance Summer Tire
        $pTire = Product::updateOrCreate(
            ['sku' => 'AP-TIRE-992'],
            [
                'brand_id' => $brands['michelin']->id,
                'category_id' => $categories['tires']->id,
                'tax_class_id' => $taxClassStandard->id,
                'name' => 'Performance Summer Tire',
                'slug' => 'performance-summer-tire',
                'part_number' => 'AP-12345',
                'short_description' => 'Ultra-high performance compound engineered for maximum dry road traction and razor-sharp steering feedback.',
                'description' => "Developed directly from motorsport championship compounds, the Performance Summer Tire delivers benchmark cornering grip, exceptional high-speed stability, and responsive dry braking performance. Equipped with dual-compound technology across the asymmetrical tread pattern for optimal road contact under extreme lateral loads.",
                'technical_specifications' => "Treadwear: 300 | Traction: AA | Temperature: A | Speed Rating: (Y) >300 km/h | Construction: Radial Steel Belted | Origin: France",
                'main_image' => 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80',
                ],
                'product_type' => 'variable',
                'base_price' => 14500.00,
                'sale_price' => 12999.00,
                'cost_price' => 8500.00,
                'stock_quantity' => 45,
                'stock_status' => 'in_stock',
                'weight' => 11.20,
                'weight_unit' => 'kg',
                'dimensions' => ['length' => 65, 'width' => 24, 'height' => 65, 'unit' => 'cm'],
                'is_featured' => true,
                'is_best_seller' => true,
                'is_new_arrival' => false,
                'status' => 'published',
                'seo_title' => 'Performance Summer Tire - Auto Parts Shop',
                'seo_description' => 'Buy Michelin Performance Summer Tires online. High-speed track and street radial performance.',
                'rating' => 4.90,
                'rating_count' => 84,
            ]
        );

        // Variations for Summer Tire
        ProductVariation::updateOrCreate(
            ['sku' => 'AP-TIRE-992-245-18'],
            [
                'product_id' => $pTire->id,
                'name' => '245/40R18 97Y XL',
                'part_number' => 'AP-12345-A',
                'attributes_json' => ['tire-width' => '245 mm', 'rim-diameter' => '18 Inch'],
                'price' => 14500.00,
                'sale_price' => 12999.00,
                'stock_quantity' => 25,
                'stock_status' => 'in_stock',
                'image' => 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
                'weight' => 11.20,
                'is_default' => true,
            ]
        );

        ProductVariation::updateOrCreate(
            ['sku' => 'AP-TIRE-992-275-19'],
            [
                'product_id' => $pTire->id,
                'name' => '275/35R19 100Y XL',
                'part_number' => 'AP-12345-B',
                'attributes_json' => ['tire-width' => '275 mm', 'rim-diameter' => '19 Inch'],
                'price' => 18500.00,
                'sale_price' => 16499.00,
                'stock_quantity' => 20,
                'stock_status' => 'in_stock',
                'image' => 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
                'weight' => 12.80,
                'is_default' => false,
            ]
        );

        // Product 2: Slotted & Drilled Brake Rotor
        $pBrake = Product::updateOrCreate(
            ['sku' => 'AP-BRK-5401'],
            [
                'brand_id' => $brands['brembo']->id,
                'category_id' => $categories['brakes']->id,
                'tax_class_id' => $taxClassHigh->id,
                'name' => 'Slotted & Drilled Brake Rotor',
                'slug' => 'slotted-drilled-brake-rotor',
                'part_number' => 'AP-54012',
                'short_description' => 'High-carbon cast iron brake rotor with directional cross-drilling and curved gas expansion slots.',
                'description' => "Engineered to withstand intense thermal stress on the street and circuit. The precision cross-drilled holes ensure optimal heat dissipation and wet-weather bite, while the bidirectional slots continuously sweep brake pad glaze and outgassing away from the contact surface.",
                'technical_specifications' => "Material: High-Carbon G3000 Alloy | Coating: Anti-corrosion Zinc Dichromate | Balancing: Dynamically 100% Runout Balanced | Vane Type: Curved Directional Vane",
                'main_image' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
                ],
                'product_type' => 'variable',
                'base_price' => 11200.00,
                'sale_price' => 9850.00,
                'cost_price' => 6200.00,
                'stock_quantity' => 38,
                'stock_status' => 'in_stock',
                'weight' => 9.40,
                'weight_unit' => 'kg',
                'dimensions' => ['length' => 36, 'width' => 36, 'height' => 8, 'unit' => 'cm'],
                'is_featured' => true,
                'is_best_seller' => true,
                'is_new_arrival' => false,
                'status' => 'published',
                'seo_title' => 'Slotted & Drilled Brake Rotor - High Performance Brakes',
                'seo_description' => 'High-carbon slotted and cross-drilled performance brake rotors with zinc coating.',
                'rating' => 4.95,
                'rating_count' => 112,
            ]
        );

        // Variations for Brake Rotor
        ProductVariation::updateOrCreate(
            ['sku' => 'AP-BRK-5401-F355'],
            [
                'product_id' => $pBrake->id,
                'name' => '355mm Front Pair (Slotted & Drilled)',
                'part_number' => 'AP-54012-F',
                'attributes_json' => ['rotor-diameter' => '355 mm', 'position' => 'Front Axle'],
                'price' => 12500.00,
                'sale_price' => 10999.00,
                'stock_quantity' => 20,
                'stock_status' => 'in_stock',
                'image' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
                'weight' => 10.20,
                'is_default' => true,
            ]
        );

        ProductVariation::updateOrCreate(
            ['sku' => 'AP-BRK-5401-R330'],
            [
                'product_id' => $pBrake->id,
                'name' => '330mm Rear Pair (Slotted & Drilled)',
                'part_number' => 'AP-54012-R',
                'attributes_json' => ['rotor-diameter' => '330 mm', 'position' => 'Rear Axle'],
                'price' => 10200.00,
                'sale_price' => 8999.00,
                'stock_quantity' => 18,
                'stock_status' => 'in_stock',
                'image' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
                'weight' => 8.60,
                'is_default' => false,
            ]
        );

        // Product 3: Performance Cat-Back Exhaust
        $pExhaust = Product::updateOrCreate(
            ['sku' => 'AP-EXH-8802'],
            [
                'brand_id' => $brands['borla']->id,
                'category_id' => $categories['exhaust']->id,
                'tax_class_id' => $taxClassStandard->id,
                'name' => 'Performance Cat-Back Exhaust',
                'slug' => 'performance-cat-back-exhaust',
                'part_number' => 'AP-88024',
                'short_description' => 'Acoustically tuned T304 aircraft-grade stainless steel cat-back exhaust with aggressive quad tips.',
                'description' => "Unleash genuine exhaust acoustics and improved horsepower with mandrel-bent T304 stainless steel piping. Straight-through multi-core patented muffler chambers reduce backpressure and provide zero in-cabin highway drone while yielding an unmistakable deep exhaust note under wide-open throttle.",
                'technical_specifications' => "Tubing Diameter: 3.0 Inch Mandrel-Bent | Material: T-304 Austenitic Stainless Steel | Tip Finish: 4.0 Inch Dual Angle-Cut Polished Tips | Sound Level: ATAK Aggressive",
                'main_image' => 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80',
                ],
                'product_type' => 'simple',
                'base_price' => 48500.00,
                'sale_price' => 42999.00,
                'cost_price' => 29000.00,
                'stock_quantity' => 12,
                'stock_status' => 'in_stock',
                'weight' => 18.50,
                'weight_unit' => 'kg',
                'dimensions' => ['length' => 150, 'width' => 45, 'height' => 30, 'unit' => 'cm'],
                'is_featured' => true,
                'is_best_seller' => true,
                'is_new_arrival' => false,
                'status' => 'published',
                'seo_title' => 'Performance Cat-Back Exhaust - Borla Stainless Steel',
                'seo_description' => 'Borla Cat-Back performance exhaust system for aggressive sound and high exhaust flow.',
                'rating' => 4.88,
                'rating_count' => 47,
            ]
        );

        // Product 4: High-Flow Cold Air Intake
        $pIntake = Product::updateOrCreate(
            ['sku' => 'AP-INT-3010'],
            [
                'brand_id' => $brands['kn-engineering']->id,
                'category_id' => $categories['intake']->id,
                'tax_class_id' => $taxClassStandard->id,
                'name' => 'High-Flow Cold Air Intake System',
                'slug' => 'high-flow-cold-air-intake-system',
                'part_number' => 'AP-30109',
                'short_description' => 'Dyno-proven cold air intake kit featuring mandrel-bent aluminum tube and washable conical cotton filter.',
                'description' => "Guaranteed to increase horsepower and throttle response. Features a custom heat shield to block hot engine bay air and direct dense, cold external air straight to the throttle body for maximum combustion efficiency.",
                'technical_specifications' => "Filter Media: Washable Oiled Cotton Gauze | Pipe: Powdercoated 3.5\" Aluminum | Estimated Gain: +14.2 HP @ 5800 RPM",
                'main_image' => 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
                ],
                'product_type' => 'simple',
                'base_price' => 24500.00,
                'sale_price' => 21999.00,
                'cost_price' => 14000.00,
                'stock_quantity' => 22,
                'stock_status' => 'in_stock',
                'weight' => 5.20,
                'weight_unit' => 'kg',
                'dimensions' => ['length' => 45, 'width' => 30, 'height' => 25, 'unit' => 'cm'],
                'is_featured' => true,
                'is_best_seller' => false,
                'is_new_arrival' => true,
                'status' => 'published',
                'seo_title' => 'High-Flow Cold Air Intake System - K&N Performance',
                'seo_description' => 'Cold air intake kits with washable performance filter for street and track builds.',
                'rating' => 4.80,
                'rating_count' => 32,
            ]
        );

        // Product 5: Track-Spec Adjustable Coilover Kit
        $pCoilovers = Product::updateOrCreate(
            ['sku' => 'AP-SUS-7700'],
            [
                'brand_id' => $brands['bilstein']->id,
                'category_id' => $categories['suspension']->id,
                'tax_class_id' => $taxClassStandard->id,
                'name' => 'Track-Spec Adjustable Coilover Kit',
                'slug' => 'track-spec-adjustable-coilover-kit',
                'part_number' => 'AP-77001',
                'short_description' => 'Monotube inverted shock dampers with 16-way combined rebound & compression damping adjustment.',
                'description' => "Engineered for drivers who demand race-winning chassis control without sacrificing road usability. Threaded aluminum shock bodies allow independent ride height adjustment from 30mm to 65mm lowering.",
                'technical_specifications' => "Design: Inverted Monotube Gas Pressurized | Adjustability: 16-click simultaneous Damping | Spring Rates: Front 8k / Rear 6k",
                'main_image' => 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
                ],
                'product_type' => 'simple',
                'base_price' => 74500.00,
                'sale_price' => 68900.00,
                'cost_price' => 48000.00,
                'stock_quantity' => 10,
                'stock_status' => 'in_stock',
                'weight' => 24.00,
                'weight_unit' => 'kg',
                'dimensions' => ['length' => 75, 'width' => 45, 'height' => 35, 'unit' => 'cm'],
                'is_featured' => true,
                'is_best_seller' => true,
                'is_new_arrival' => false,
                'status' => 'published',
                'seo_title' => 'Bilstein Track-Spec Adjustable Coilover Kit',
                'seo_description' => 'Bilstein inverted monotube coilovers with independent ride height adjustment.',
                'rating' => 4.96,
                'rating_count' => 64,
            ]
        );

        // 7. Vehicle Compatibility Fitment Mapping
        // Associate Mustang GT, BMW M3, Corvette with products
        $allProducts = [$pTire, $pBrake, $pExhaust, $pIntake, $pCoilovers];
        foreach ($vehicles as $v) {
            // Tire fits all
            ProductVehicle::firstOrCreate([
                'product_id' => $pTire->id,
                'product_variation_id' => null,
                'vehicle_id' => $v->id,
            ], [
                'notes' => 'Direct OEM fitment for factory wheel sizes.',
                'position' => 'All',
            ]);

            // Brake rotor fits Mustang, M3, Supra, Civic
            if (in_array($v->make, ['Ford', 'BMW', 'Toyota', 'Honda'])) {
                ProductVehicle::firstOrCreate([
                    'product_id' => $pBrake->id,
                    'product_variation_id' => null,
                    'vehicle_id' => $v->id,
                ], [
                    'notes' => 'Requires 18-inch or larger diameter wheels for caliper clearance.',
                    'position' => 'Front & Rear',
                ]);
            }

            // Exhaust fits Ford Mustang GT & BMW M3
            if ($v->make === 'Ford' && str_contains($v->model, 'Mustang')) {
                ProductVehicle::firstOrCreate([
                    'product_id' => $pExhaust->id,
                    'product_variation_id' => null,
                    'vehicle_id' => $v->id,
                ], [
                    'notes' => 'Direct bolt-on cat-back connection. Fits factory active exhaust valves.',
                    'position' => 'Rear',
                ]);

                ProductVehicle::firstOrCreate([
                    'product_id' => $pIntake->id,
                    'product_variation_id' => null,
                    'vehicle_id' => $v->id,
                ], [
                    'notes' => 'Direct fit with mass airflow sensor housing.',
                    'position' => 'Engine Bay',
                ]);
            }

            if ($v->make === 'BMW' && $v->model === 'M3') {
                ProductVehicle::firstOrCreate([
                    'product_id' => $pCoilovers->id,
                    'product_variation_id' => null,
                    'vehicle_id' => $v->id,
                ], [
                    'notes' => 'Compatible with EDC adaptive suspension bypass modules.',
                    'position' => 'All Corners',
                ]);
            }
        }

        // 8. Coupons
        Coupon::updateOrCreate(
            ['code' => 'SPEED10'],
            [
                'type' => 'percentage',
                'value' => 10.00,
                'min_spend' => 5000.00,
                'max_discount' => 3000.00,
                'usage_limit' => 1000,
                'usage_per_user' => 3,
                'is_active' => true,
            ]
        );

        Coupon::updateOrCreate(
            ['code' => 'TRACKDAY'],
            [
                'type' => 'fixed',
                'value' => 2000.00,
                'min_spend' => 15000.00,
                'max_discount' => 2000.00,
                'usage_limit' => 500,
                'usage_per_user' => 1,
                'is_active' => true,
            ]
        );

        // 9. Customer address for seed user
        $customerUser = User::where('email', 'customer@autoparts.com')->first();
        if ($customerUser) {
            CustomerAddress::firstOrCreate(
                ['user_id' => $customerUser->id, 'address_line1' => 'Flat 402, Speedline Towers, Outer Ring Road'],
                [
                    'type' => 'both',
                    'full_name' => 'Vikram Singh',
                    'phone' => '+91 98765 12345',
                    'address_line2' => 'Near Formula 1 Circuit Track',
                    'city' => 'Greater Noida',
                    'state' => 'Uttar Pradesh',
                    'pincode' => '201310',
                    'country' => 'India',
                    'is_default' => true,
                ]
            );

            // Sample Order for customer
            $sampleOrder = Order::firstOrCreate(
                ['order_number' => 'AP-20261119-DEMO1'],
                [
                    'user_id' => $customerUser->id,
                    'customer_name' => 'Vikram Singh',
                    'customer_email' => 'customer@autoparts.com',
                    'customer_phone' => '+91 98765 12345',
                    'shipping_address' => 'Flat 402, Speedline Towers, Outer Ring Road',
                    'apartment' => 'Tower B, 4th Floor',
                    'city' => 'Greater Noida',
                    'state' => 'Uttar Pradesh',
                    'pincode' => '201310',
                    'country' => 'India',
                    'shipping_method_title' => 'Express Ground Freight',
                    'shipping_cost' => 500.00,
                    'subtotal' => 25998.00,
                    'discount_amount' => 2000.00,
                    'coupon_code' => 'TRACKDAY',
                    'tax_amount' => 4319.64,
                    'cgst_amount' => 0.00,
                    'sgst_amount' => 0.00,
                    'igst_amount' => 4319.64,
                    'total_amount' => 28817.64,
                    'currency' => 'INR',
                    'payment_method' => 'razorpay',
                    'payment_status' => 'paid',
                    'delivery_status' => 'processing',
                    'razorpay_order_id' => 'order_sim_demo_01',
                    'razorpay_payment_id' => 'pay_sim_demo_01',
                    'razorpay_signature' => 'simulated_signature',
                    'order_notes' => 'Please deliver during afternoon hours.',
                    'tracking_number' => 'BLUEDART-88291039',
                    'tracking_carrier' => 'Blue Dart Express',
                    'tracking_url' => 'https://www.bluedart.com',
                    'paid_at' => now()->subDay(),
                ]
            );

            OrderItem::firstOrCreate(
                ['order_id' => $sampleOrder->id, 'product_id' => $pTire->id],
                [
                    'product_name' => 'Performance Summer Tire',
                    'variation_name' => '245/40R18 97Y XL',
                    'sku' => 'AP-TIRE-992-245-18',
                    'part_number' => 'AP-12345-A',
                    'unit_price' => 12999.00,
                    'quantity' => 2,
                    'tax_rate_percent' => 18.00,
                    'tax_amount' => 4319.64,
                    'subtotal' => 25998.00,
                    'total' => 30317.64,
                    'product_image' => 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
                ]
            );
        }

        // 10. Product Reviews
        ProductReview::firstOrCreate(
            ['product_id' => $pTire->id, 'reviewer_email' => 'driver@circuit.in'],
            [
                'reviewer_name' => 'Arjun Kapoor',
                'rating' => 5,
                'title' => 'Unbelievable dry grip on Buddh International Circuit',
                'comment' => 'Installed a staggered set on my Mustang GT. Cornering speeds are noticeably higher and braking stability is rock solid.',
                'is_verified_purchase' => true,
                'is_approved' => true,
            ]
        );

        ProductReview::firstOrCreate(
            ['product_id' => $pBrake->id, 'reviewer_email' => 'trackdayfan@gmail.com'],
            [
                'reviewer_name' => 'Rohan Mehta',
                'rating' => 5,
                'title' => 'Zero brake fade during hard track sessions',
                'comment' => 'Rotors run much cooler than the stock blanks. The zinc coating keeps the hub bells looking brand new even after washings.',
                'is_verified_purchase' => true,
                'is_approved' => true,
            ]
        );

        // 11. Banners
        Banner::updateOrCreate(
            ['type' => 'hero'],
            [
                'title' => 'BUILD UPGRADE PERFORM',
                'eyebrow' => 'PERFORMANCE PARTS FOR DRIVERS',
                'subtitle' => 'PREMIUM AUTOMOTIVE SPARE PARTS FOR STREET, TRACK, AND GARAGE BUILDS.',
                'button_text' => 'SHOP PERFORMANCE',
                'button_link' => '/shop',
                'image' => '/images/hero/automotive-hero.png',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );
    }
}
