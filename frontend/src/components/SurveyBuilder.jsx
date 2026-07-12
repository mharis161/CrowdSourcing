import React, { useState, useMemo, useEffect } from 'react';
import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';
import { X, Save } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';

// Import SurveyJS required styles
import 'survey-core/survey-core.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
import './SurveyBuilder.css';
import { ComponentCollection } from 'survey-core';

// Register Custom GPS Location Question Type
if (!ComponentCollection.Instance.getCustomQuestionByName("gpslocation")) {
  ComponentCollection.Instance.add({
    name: "gpslocation",
    title: "GPS Location",
    elementsJSON: [
      {
        type: "html",
        name: "helpInfo",
        html: "<div style='padding:12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; margin-bottom:15px; color:#166534; font-weight: 500; display: flex; align-items: center; gap: 8px;'><svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'></path><circle cx='12' cy='10' r='3'></circle></svg> Mobile app will securely capture GPS coordinates here</div>"
      },
      {
        type: "multipletext",
        name: "coordinates",
        titleLocation: "hidden",
        items: [
          { name: "latitude", title: "Latitude", readOnly: true },
          { name: "longitude", title: "Longitude", readOnly: true }
        ]
      }
    ]
  });
}

const SurveyBuilder = ({ initialJson, onSave, onClose }) => {
  const showToast = useToastStore(state => state.showToast);


  const creator = useMemo(() => {
    const creatorOptions = {
      showLogicTab: true,
      isAutoSave: false,
      showJSONEditorTab: true
    };
    
    const c = new SurveyCreator(creatorOptions);
    
    // Set theme to modern V2
    c.onSurveyInstanceCreated.add((sender, options) => {
      if (options.area === "designer-tab" || options.area === "preview-tab") {
        options.survey.applyTheme({
          themeName: "default",
          colorDictionary: {
            light: {
              primary: "#7f0df2",
            }
          }
        });
      }
    });

    if (initialJson && Object.keys(initialJson).length > 0) {
      c.JSON = initialJson;
    }
    
    return c;
  }, []); // Initialize only once on mount

  // Mutates jsonObj in place: converts plain-text choices (e.g. "A") into
  // explicit { value, text } pairs so downstream data parsing always has a
  // stable value distinct from the display label. Still errors on choices
  // that end up with no usable value (e.g. an empty string).
  const normalizeSurveyData = (jsonObj) => {
    if (!jsonObj) return null;
    let error = null;
    const nameSet = new Set(); // For unique name validation

    const checkElements = (elements) => {
      if (!elements) return;
      for (const el of elements) {
        if (el.name) {
          if (nameSet.has(el.name)) {
            error = `Duplicate question identifier detected: "${el.name}". All questions must have a unique name.`;
            return;
          }
          nameSet.add(el.name);
        }

        if (['radiogroup', 'checkbox', 'dropdown', 'imagepicker'].includes(el.type) && el.choices) {
          el.choices = el.choices.map((choice) =>
            typeof choice === 'string' ? { value: choice, text: choice } : choice
          );
          for (const choice of el.choices) {
            if (choice.value === undefined || choice.value === null || String(choice.value).trim() === '') {
              error = `Question "${el.name}" has a choice missing a 'Value'. Value properties are compulsory.`;
              return;
            }
          }
        }
        // Handle nested elements like panels and matrices
        if (el.elements) checkElements(el.elements);
        if (el.templateElements) checkElements(el.templateElements);
      }
    };

    if (jsonObj.pages) {
      for (const page of jsonObj.pages) {
        checkElements(page.elements);
        if (error) break;
      }
    }
    return error;
  };

  useEffect(() => {
    // Custom save action
    creator.saveSurveyFunc = (saveNo, callback) => {
      const json = creator.JSON;
      const validationError = normalizeSurveyData(json);
      if (validationError) {
        showToast(validationError, 'error');
        callback(saveNo, false);
        return;
      }
      onSave(json);

      callback(saveNo, true);
    };
  }, [creator, onSave]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#f8fafc] flex flex-col h-screen overflow-hidden animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#7f0df2] p-1.5 rounded-lg">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="10" y1="9" x2="8" y2="9"></line>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-none">Survey Builder</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Design data collection logic</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="px-4 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={() => {
              const json = creator.JSON;
              const validationError = normalizeSurveyData(json);
              if (validationError) {
                showToast(validationError, 'error');
                return;
              }
              onSave(json);

            }}
            className="px-6 h-10 bg-[#7f0df2] hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-purple-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Survey
          </button>
        </div>
      </div>
      
      {/* SurveyJS Editor Container */}
      <div className="flex-1 overflow-hidden">
        <SurveyCreatorComponent creator={creator} />
      </div>
    </div>
  );
};

export default SurveyBuilder;
