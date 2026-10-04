import { connectDB, disconnectDB } from "../config/db";
import { LegalCategory } from "../models/LegalCategory";
import { LegalProvision } from "../models/LegalProvision";

const categories = [
  {
    name: "Property & Land",
    slug: "property-land",
    description:
      "General information about property ownership, possession, land disputes and related matters.",
    icon: "landmark",
    keywords: [
      "property",
      "land",
      "plot",
      "house",
      "ownership",
      "possession",
      "boundary",
      "inheritance property",
    ],
    synonyms: ["zameen", "jaidad", "makaan", "plot", "milkiyat"],
  },
  {
    name: "Family Law",
    slug: "family-law",
    description:
      "General information about marriage, divorce, maintenance, guardianship and family disputes.",
    icon: "users",
    keywords: [
      "marriage",
      "divorce",
      "khula",
      "maintenance",
      "custody",
      "guardianship",
      "family",
      "child",
    ],
    synonyms: ["nikah", "talaq", "khula", "bachay", "nafaqa"],
  },
  {
    name: "Criminal Law",
    slug: "criminal-law",
    description:
      "General information about reported offences, criminal complaints and related legal provisions.",
    icon: "shield-alert",
    keywords: [
      "crime",
      "criminal",
      "theft",
      "robbery",
      "assault",
      "fraud",
      "threat",
      "murder",
      "fir",
      "police",
    ],
    synonyms: ["jurm", "chori", "dakaiti", "dhamki", "muqadma", "FIR"],
  },
  {
    name: "Cyber Crime",
    slug: "cyber-crime",
    description:
      "General information about online harassment, unauthorized access, electronic fraud and other cyber-related issues.",
    icon: "monitor",
    keywords: [
      "cyber",
      "online",
      "internet",
      "hacking",
      "harassment",
      "blackmail",
      "social media",
      "account",
      "online fraud",
    ],
    synonyms: ["internet crime", "online blackmail", "digital fraud"],
  },
  {
    name: "Consumer Protection",
    slug: "consumer-protection",
    description:
      "General information about defective products, poor services, misleading claims and consumer disputes.",
    icon: "shopping-cart",
    keywords: [
      "consumer",
      "product",
      "service",
      "defective",
      "refund",
      "warranty",
      "shop",
      "seller",
      "purchase",
    ],
    synonyms: ["customer", "buyer", "shopping", "return"],
  },
  {
    name: "Employment & Labour",
    slug: "employment-labour",
    description:
      "General information about employment disputes, wages, termination and workplace matters.",
    icon: "briefcase",
    keywords: [
      "job",
      "employment",
      "salary",
      "wage",
      "termination",
      "dismissal",
      "employee",
      "employer",
      "workplace",
    ],
    synonyms: ["naukri", "mulazmat", "tankhwa", "job dispute"],
  },
];

const provisions = [
  {
    categorySlug: "property-land",
    lawName: "Transfer of Property Act, 1882",
    section: "Section 54",
    title: "Sale of immovable property",
    plainExplanation:
      "Provides the statutory framework concerning transfer of ownership in immovable property by sale.",
    keywords: ["property", "sale", "land", "house", "ownership"],
  },
  {
    categorySlug: "property-land",
    lawName: "Transfer of Property Act, 1882",
    section: "Section 53A",
    title: "Part performance",
    plainExplanation:
      "Concerns certain situations involving possession or acts performed under a contract for transfer of immovable property.",
    keywords: ["property", "possession", "agreement", "land", "contract"],
  },
  {
    categorySlug: "family-law",
    lawName: "Family Courts Act, 1964",
    section: "Section 5",
    title: "Jurisdiction of Family Courts",
    plainExplanation:
      "Provides for matters that fall within the jurisdiction of Family Courts, subject to the applicable law.",
    keywords: ["family", "marriage", "divorce", "maintenance", "custody"],
  },
  {
    categorySlug: "criminal-law",
    lawName: "Pakistan Penal Code, 1860",
    section: "Section 379",
    title: "Theft",
    plainExplanation:
      "Contains the legal provision concerning the offence of theft and its punishment.",
    keywords: ["theft", "stealing", "chori", "property"],
  },
  {
    categorySlug: "criminal-law",
    lawName: "Pakistan Penal Code, 1860",
    section: "Section 420",
    title: "Cheating and dishonestly inducing delivery of property",
    plainExplanation:
      "Contains a provision concerning cheating and dishonest inducement involving delivery of property.",
    keywords: ["fraud", "cheating", "property", "deception", "scam"],
  },
  {
    categorySlug: "cyber-crime",
    lawName: "Prevention of Electronic Crimes Act, 2016",
    section: "Section 20",
    title: "Offences against dignity of a natural person",
    plainExplanation:
      "Addresses certain electronic acts affecting the dignity of a natural person, subject to the statutory requirements.",
    keywords: ["online", "harassment", "social media", "dignity", "cyber"],
  },
  {
    categorySlug: "cyber-crime",
    lawName: "Prevention of Electronic Crimes Act, 2016",
    section: "Section 21",
    title: "Offences against modesty of a natural person and minor",
    plainExplanation:
      "Addresses specified electronic acts involving modesty, with additional protections relating to minors.",
    keywords: ["online", "harassment", "blackmail", "images", "cyber"],
  },
  {
    categorySlug: "consumer-protection",
    lawName: "Punjab Consumer Protection Act, 2005",
    section: "General consumer protection",
    title: "Consumer rights and complaints",
    plainExplanation:
      "Provides a legal framework for consumer complaints concerning goods and services in Punjab.",
    keywords: ["consumer", "product", "service", "refund", "defective"],
  },
  {
    categorySlug: "employment-labour",
    lawName: "Applicable Labour Laws",
    section: "General employment protections",
    title: "Employment and workplace matters",
    plainExplanation:
      "Employment rights and remedies depend on the applicable federal or provincial labour law and the specific employment relationship.",
    keywords: ["salary", "wage", "employee", "employer", "termination", "job"],
  },
];

const seed = async (): Promise<void> => {
  try {
    await connectDB();

    const categoryMap = new Map<string, string>();

    for (const category of categories) {
      const result = await LegalCategory.findOneAndUpdate(
        { slug: category.slug },
        { $set: category },
        { upsert: true, new: true },
      );

      categoryMap.set(category.slug, result._id.toString());
    }

    for (const provision of provisions) {
      const categoryId = categoryMap.get(provision.categorySlug);

      if (!categoryId) {
        throw new Error(
          `Category not found for provision: ${provision.categorySlug}`,
        );
      }

      await LegalProvision.findOneAndUpdate(
        {
          category: categoryId,
          lawName: provision.lawName,
          section: provision.section,
        },
        {
          $set: {
            category: categoryId,
            lawName: provision.lawName,
            section: provision.section,
            title: provision.title,
            plainExplanation: provision.plainExplanation,
            keywords: provision.keywords,
            isActive: true,
          },
        },
        { upsert: true, new: true },
      );
    }

    console.log(`✅ Seeded ${categories.length} legal categories`);
    console.log(`✅ Seeded ${provisions.length} legal provisions`);
  } catch (error) {
    console.error("❌ Legal seed failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

void seed();
