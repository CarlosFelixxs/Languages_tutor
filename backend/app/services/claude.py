"""Claude AI tutor service — system prompts tailored for Brazilian Portuguese speakers."""
from typing import Generator
import anthropic
from app.config import settings

_client: anthropic.Anthropic | None = None


def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


SYSTEM_ES = """Você é um professor de espanhol especializado em ensinar falantes de português brasileiro.

Regras obrigatórias:
1. Quando explicar gramática ou dar dicas, USE PORTUGUÊS.
2. Ao praticar conversa, fale em ESPANHOL, mas corrija erros em português.
3. Destaque cognatos FALSOS críticos (embarazada=grávida, polvo=pó, borracha=bêbada, largo=longo, exquisito=delicioso).
4. Aponte diferenças de pronúncia: espanhol não tem vogais nasais como português (ã, õ).
5. Explique diferenças de ser/estar e do subjuntivo entre português e espanhol.
6. Seja encorajador — o usuário já tem base no português, que ajuda muito.
7. Respostas curtas e mobile-friendly (parágrafos breves)."""

SYSTEM_RU = """Você é um professor de russo especializado em ensinar falantes de português brasileiro.

Regras obrigatórias:
1. SEMPRE explique gramática EM PORTUGUÊS.
2. Use transliteração fonética ao lado do cirílico: привет [privet].
3. Relacione os 6 casos russos com preposições do português: "в Москве" = "em Moscou" (preposição → caso locativo).
4. Explique que russo NÃO usa verbo 'ser/estar' no presente: "Я студент" = "Eu [sou] estudante".
5. Para o alfabeto, mapeie sons conhecidos: Р=R vibrante, В=V, Н=N, С=S (não C!).
6. O aspecto verbal (perfectivo/imperfectivo) não existe em português — explique com exemplos.
7. Seja paciente — russo é genuinamente difícil para falantes de português.
8. Respostas curtas e mobile-friendly."""


def _system_prompt(language: str) -> str:
    return SYSTEM_ES if language == "spanish" else SYSTEM_RU


def chat(language: str, messages: list[dict], topic: str | None = None) -> str:
    """Send a conversation exchange and return the assistant reply."""
    system = _system_prompt(language)
    if topic:
        system += f"\n\nTópico desta conversa: {topic}"
    response = get_client().messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=settings.MAX_TOKENS_CONVERSATION,
        system=system,
        messages=messages,
    )
    return response.content[0].text


def stream_chat(
    language: str, messages: list[dict], topic: str | None = None
) -> Generator[str, None, None]:
    """Stream chat tokens for server-sent events."""
    system = _system_prompt(language)
    if topic:
        system += f"\n\nTópico desta conversa: {topic}"
    with get_client().messages.stream(
        model=settings.CLAUDE_MODEL,
        max_tokens=settings.MAX_TOKENS_CONVERSATION,
        system=system,
        messages=messages,
    ) as stream:
        yield from stream.text_stream


def explain(language: str, word_or_phrase: str, context: str | None = None) -> str:
    """Get a concise grammar/vocabulary explanation for a word or phrase."""
    lang_name = "espanhol" if language == "spanish" else "russo"
    ctx = f'\nContexto de uso: "{context}"' if context else ""
    prompt = (
        f'Explique brevemente "{word_or_phrase}" em {lang_name}{ctx}.\n\n'
        "Inclua:\n"
        "1. Significado\n"
        "2. Como pronunciar (para falante de português)\n"
        "3. Dica ou armadilha para quem vem do português\n"
        "4. Um exemplo curto de uso\n\n"
        "Máximo 3 parágrafos curtos."
    )
    response = get_client().messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=settings.MAX_TOKENS_EXPLANATION,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text
