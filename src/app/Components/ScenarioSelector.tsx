"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Beaker, Book, Dna, Atom } from "lucide-react";
import { Textarea } from "@/src/components/ui/textarea";
import { useApi } from "gabber-client-react";
import { ChatPage } from "@/src/app/Components/ChatPage";

interface Persona {
  id: string;
  name: string;
  description: string;
  voice: string;
}

const personaChoices = [
  { id: "6af15944-7287-4c1a-9b7c-daee7f1f8c27", name: "Sherry", image: "/teacher.png" },
  { id: "f7b3e8e6-1e00-4370-9fb6-612d399cba79", name: "Sam", image: "/teacher2.png" },
];

export const ScenarioSelector = ({
  personaId,
  onBack,
  voiceId,
  usageToken,
}: {
  personaId: string;
  onBack: () => void;
  voiceId: string | null;
  usageToken: string;
}) => {
  const { api } = useApi(); // Hook moved inside the component
  const router = useRouter();

  const [selectedPersona, setSelectedPersona] = useState<Persona>();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");
  const [contextId, setContextId] = useState<string>("");

  const subjects = [
    { id: "spanish", name: "Spanish", icon: Book },
    { id: "chemistry", name: "Chemistry", icon: Atom },
    { id: "physics", name: "Physics", icon: Beaker },
    { id: "biology", name: "Biology", icon: Dna },
  ];

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const response = await api.persona.listPersonas();
        const filteredPersonas = response.data.values.filter((persona) =>
          personaChoices.some((choice) => choice.id === persona.id)
        );
        const mappedPersonas = filteredPersonas.map(persona => ({
          ...persona,
          voiceId: persona.voice || '', // Ensure voiceId is always present
        })) || [];
        setPersonas(mappedPersonas);
        
        // Set the first persona as default if we have any personas
        if (mappedPersonas.length > 0) {
          setSelectedPersona(mappedPersonas[0]);
        }
      } catch (err) {
        console.error("Error fetching personas:", err);
      }
    };

    fetchPersonas();
  }, [api]);

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !question.trim()) return;

    const context = selectedPersona?.description + `You and I are in a one on one lesson. You are teaching me ${selectedSubject}. My main question is centered around "${question}" so answer it in a way that is easy to understand, and ask if I have questions.`;
    setChatPrompt(context);
    
    console.log(context);
    
    const contextResponse = await api.llm.createContext({
      messages: [
        {
          role: "system",
          content: context
        }
      ]
    });
    setContextId(contextResponse.data.id);
    setShowChat(true);
  };

  if (showChat && selectedPersona) {
    return (
      <div className="w-[390px] h-[500px] mx-auto border border-gray-200 rounded-3xl overflow-hidden shadow-xl">
        <ChatPage 
          context={contextId}
          usageToken={usageToken}
          voice={selectedPersona.voice}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back
        </button>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose your Teacher</h2>
          <div className="grid grid-cols-2 gap-4">
            {personas.map((persona) => {
              const personaChoice = personaChoices.find((choice) => choice.id === persona.id);
              return (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaSelect(persona)}
                  className={`p-4 rounded-lg border transition-all flex items-center gap-3 ${
                    selectedPersona?.id === persona.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <img
                    src={personaChoice?.image}
                    alt={persona.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{persona.name}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedPersona && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose a Subject</h2>
            <div className="grid grid-cols-2 gap-4">
              {subjects.map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleSubjectSelect(id)}
                  className={`p-4 rounded-lg border transition-all flex items-center gap-3 ${
                    selectedSubject === id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <Icon className="w-6 h-6 text-blue-600" />
                  <div className="font-medium text-gray-900">{name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedSubject && (
        <div className="border-t bg-white p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                What would you like to learn?
              </h2>
            </div>

            <div className="space-y-4">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="w-full h-24 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900"
              />

              <button
                onClick={handleSubmit}
                disabled={!question.trim()}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Learning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
