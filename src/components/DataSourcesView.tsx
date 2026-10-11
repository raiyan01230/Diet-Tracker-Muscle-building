import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

export function DataSourcesView() {
  const sources = [
    {
      title: 'Food Composition Table for Bangladesh (2013)',
      publisher: 'FAO (Food and Agriculture Organization)',
      version: 'Version 10.2 / 2013 Final',
      url: 'https://www.fao.org/fileadmin/templates/food_composition/documents/FCT_10_2_14_final_version.pdf',
      description: 'Primary reference source for matching local Bangladeshi foods such as bhaat, roti, dal, ilish, rui, peyara, and amloki.',
    },
    {
      title: 'USDA FoodData Central',
      publisher: 'U.S. Department of Agriculture',
      version: '2024 Release',
      url: 'https://fdc.nal.usda.gov/',
      description: 'Secondary source for branded and additional food items not covered in local tables.',
    },
    {
      title: 'Dietary Reference Intakes (DRIs) for Vitamins & Minerals',
      publisher: 'NIH Office of Dietary Supplements & National Academies',
      version: 'Current Editions',
      url: 'https://ods.od.nih.gov/factsheets/list-all/',
      description: 'Age- and sex-specific RDA, AI, and UL reference values.',
    },
    {
      title: 'WHO Growth Reference Data for 5-19 Years',
      publisher: 'World Health Organization',
      version: '2007 Reference Standards',
      url: 'https://www.who.int/tools/growth-reference-data-for-5to19-years',
      description: 'Height-for-age and BMI-for-age observation reference curves for adolescents.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
        <h1 className="text-xl font-bold text-stone-900">Data Sources & Transparency</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Complete citation registry and version metadata for all nutritional datasets and growth references.
        </p>
      </div>

      <div className="space-y-4">
        {sources.map((src, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                  {src.publisher}
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-2">{src.title}</h3>
                <p className="text-xs text-stone-500 mt-1">{src.description}</p>
              </div>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors border border-stone-300"
              >
                <span>Source Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Dataset Version: <strong className="text-stone-800">{src.version}</strong></span>
              <span className="flex items-center space-x-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Active Source</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
