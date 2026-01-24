import {
  getPromptForFormat,
  getUserPrompt,
  getXThreadPrompt,
  getLinkedInPostPrompt,
  getLinkedInArticlePrompt,
} from "@/lib/groq/prompts";

describe("getXThreadPrompt", () => {
  it("should include professional tone instructions", () => {
    const prompt = getXThreadPrompt("profesional");
    expect(prompt).toContain("TONO PROFESIONAL");
    expect(prompt).toContain("registro formal");
  });

  it("should include cercano tone instructions", () => {
    const prompt = getXThreadPrompt("cercano");
    expect(prompt).toContain("TONO CERCANO");
    expect(prompt).toContain("tuteo natural");
  });

  it("should include tecnico tone instructions", () => {
    const prompt = getXThreadPrompt("tecnico");
    expect(prompt).toContain("TONO TÉCNICO");
    expect(prompt).toContain("jerga");
  });

  it("should include X Thread format instructions", () => {
    const prompt = getXThreadPrompt("profesional");
    expect(prompt).toContain("HILO DE X");
    expect(prompt).toContain("280 caracteres");
    expect(prompt).toContain("5-7 tweets");
  });

  it("should include topics when provided", () => {
    const prompt = getXThreadPrompt("profesional", ["AI", "Machine Learning"]);
    expect(prompt).toContain("TEMAS A INTEGRAR");
    expect(prompt).toContain("AI");
    expect(prompt).toContain("Machine Learning");
  });

  it("should not include topics section when not provided", () => {
    const prompt = getXThreadPrompt("profesional");
    expect(prompt).not.toContain("TEMAS A INTEGRAR");
  });
});

describe("getLinkedInPostPrompt", () => {
  it("should include LinkedIn Post format instructions", () => {
    const prompt = getLinkedInPostPrompt("profesional");
    expect(prompt).toContain("POST DE LINKEDIN");
    expect(prompt).toContain("1.200 y 1.500 caracteres");
    expect(prompt).toContain("ver más");
  });

  it("should include topics when provided", () => {
    const prompt = getLinkedInPostPrompt("cercano", ["Startups", "Growth"]);
    expect(prompt).toContain("Startups");
    expect(prompt).toContain("Growth");
  });

  it("should include tone description", () => {
    const prompt = getLinkedInPostPrompt("cercano");
    expect(prompt).toContain("TONO CERCANO");
  });
});

describe("getLinkedInArticlePrompt", () => {
  it("should include LinkedIn Article format instructions", () => {
    const prompt = getLinkedInArticlePrompt("tecnico");
    expect(prompt).toContain("ARTÍCULO DE LINKEDIN");
    expect(prompt).toContain("1.500 y 2.500 palabras");
    expect(prompt).toContain("Markdown");
  });

  it("should include subtitles instructions", () => {
    const prompt = getLinkedInArticlePrompt("profesional");
    expect(prompt).toContain("##");
    expect(prompt).toContain("H2");
  });

  it("should include topics when provided", () => {
    const prompt = getLinkedInArticlePrompt("profesional", ["Web3", "Crypto"]);
    expect(prompt).toContain("Web3");
    expect(prompt).toContain("Crypto");
  });
});

describe("getPromptForFormat", () => {
  it("should return X Thread prompt for x_thread format", () => {
    const prompt = getPromptForFormat("x_thread", "profesional");
    expect(prompt).toContain("HILO DE X");
  });

  it("should return LinkedIn Post prompt for linkedin_post format", () => {
    const prompt = getPromptForFormat("linkedin_post", "cercano");
    expect(prompt).toContain("POST DE LINKEDIN");
  });

  it("should return LinkedIn Article prompt for linkedin_article format", () => {
    const prompt = getPromptForFormat("linkedin_article", "tecnico");
    expect(prompt).toContain("ARTÍCULO DE LINKEDIN");
  });

  it("should pass topics to the underlying prompt function", () => {
    const topics = ["Topic1", "Topic2"];
    const prompt = getPromptForFormat("x_thread", "profesional", topics);
    expect(prompt).toContain("Topic1");
    expect(prompt).toContain("Topic2");
  });

  it("should throw error for unknown format", () => {
    expect(() => getPromptForFormat("unknown" as "x_thread", "profesional")).toThrow(
      "Formato no soportado"
    );
  });
});

describe("getUserPrompt", () => {
  it("should include content in the prompt", () => {
    const content = "This is the original content";
    const prompt = getUserPrompt(content, "x_thread");
    expect(prompt).toContain(content);
  });

  it("should mention the correct format for x_thread", () => {
    const prompt = getUserPrompt("content", "x_thread");
    expect(prompt).toContain("hilo de X (Twitter)");
  });

  it("should mention the correct format for linkedin_post", () => {
    const prompt = getUserPrompt("content", "linkedin_post");
    expect(prompt).toContain("post de LinkedIn");
  });

  it("should mention the correct format for linkedin_article", () => {
    const prompt = getUserPrompt("content", "linkedin_article");
    expect(prompt).toContain("artículo de LinkedIn");
  });

  it("should include content delimiters", () => {
    const prompt = getUserPrompt("content", "x_thread");
    expect(prompt).toContain("---CONTENIDO ORIGINAL---");
    expect(prompt).toContain("---FIN DEL CONTENIDO---");
  });
});
