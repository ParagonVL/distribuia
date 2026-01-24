import { useState, useCallback } from "react";

const MAX_TOPICS = 5;

export function useTopics(initialTopics: string[] = []) {
  const [topics, setTopics] = useState<string[]>(initialTopics);
  const [topicInput, setTopicInput] = useState("");

  const addTopic = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "," || e.key === "Enter") && topicInput.trim()) {
      e.preventDefault();
      const newTopic = topicInput.trim().replace(/,/g, "");
      if (newTopic && topics.length < MAX_TOPICS && !topics.includes(newTopic)) {
        setTopics((prev) => [...prev, newTopic]);
      }
      setTopicInput("");
    }
  }, [topicInput, topics]);

  const removeTopic = useCallback((topicToRemove: string) => {
    setTopics((prev) => prev.filter((t) => t !== topicToRemove));
  }, []);

  const clearTopics = useCallback(() => {
    setTopics([]);
    setTopicInput("");
  }, []);

  const canAddMore = topics.length < MAX_TOPICS;

  return {
    topics,
    topicInput,
    setTopicInput,
    addTopic,
    removeTopic,
    clearTopics,
    canAddMore,
    maxTopics: MAX_TOPICS,
  };
}
