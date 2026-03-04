from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import json

from app.database import get_db
from app.models.lesson import Lesson

router = APIRouter()

BUILTIN_LESSONS = [
    {
        "language": "spanish",
        "title": "Falsos Cognatos — Os Traidores do Espanhol",
        "slug": "es-falsos-cognatos",
        "lesson_type": "vocabulary",
        "order_idx": 1,
        "content": json.dumps({
            "sections": [
                {
                    "type": "intro",
                    "text": "Como falante de português, você tem uma grande vantagem: já conhece milhares de palavras em espanhol! Mas cuidado com os FALSOS COGNATOS — palavras que parecem iguais, mas significam coisas bem diferentes."
                },
                {
                    "type": "warning",
                    "title": "Falsos Cognatos Críticos",
                    "items": [
                        {"pt": "embaraçado/a (com vergonha)", "es": "avergonzado/a", "trap": "embarazada = GRÁVIDA em espanhol!"},
                        {"pt": "polvo (cefalópode)", "es": "pulpo", "trap": "polvo em espanhol = PÓ (poeira)!"},
                        {"pt": "borracha (material)", "es": "goma / caucho", "trap": "borracha em espanhol = mulher bêbada!"},
                        {"pt": "esquisito (estranho)", "es": "raro / extraño", "trap": "exquisito em espanhol = delicioso, requintado!"},
                        {"pt": "bala (doce)", "es": "caramelo / dulce", "trap": "bala em espanhol = BALA (projétil)!"}
                    ]
                },
                {
                    "type": "tip",
                    "text": "Dica: sempre que quiser dizer algo importante, confirme se a palavra existe em espanhol com o mesmo significado. Quando tiver dúvida, use 'lo que quiero decir es...' (o que quero dizer é...)."
                }
            ]
        })
    },
    {
        "language": "spanish",
        "title": "Ser vs. Estar — A Grande Diferença",
        "slug": "es-ser-estar",
        "lesson_type": "grammar",
        "order_idx": 2,
        "content": json.dumps({
            "sections": [
                {
                    "type": "intro",
                    "text": "Em espanhol, tanto 'ser' quanto 'estar' traduzem o verbo 'ser/estar' do português. A diferença é mais sistemática do que no português."
                },
                {
                    "type": "grammar_table",
                    "title": "Quando usar SER",
                    "rows": [
                        {"uso": "Identidade", "exemplo_es": "Soy Carlos.", "exemplo_pt": "Sou Carlos."},
                        {"uso": "Origem / Nacionalidade", "exemplo_es": "Soy brasileño.", "exemplo_pt": "Sou brasileiro."},
                        {"uso": "Profissão", "exemplo_es": "Soy estudiante.", "exemplo_pt": "Sou estudante."},
                        {"uso": "Características permanentes", "exemplo_es": "La mesa es de madera.", "exemplo_pt": "A mesa é de madeira."},
                        {"uso": "Hora / Data", "exemplo_es": "Son las tres.", "exemplo_pt": "São três horas."}
                    ]
                },
                {
                    "type": "grammar_table",
                    "title": "Quando usar ESTAR",
                    "rows": [
                        {"uso": "Estados temporários", "exemplo_es": "Estoy cansado.", "exemplo_pt": "Estou cansado."},
                        {"uso": "Localização", "exemplo_es": "El hotel está aquí.", "exemplo_pt": "O hotel fica aqui."},
                        {"uso": "Resultado de ação", "exemplo_es": "La puerta está abierta.", "exemplo_pt": "A porta está aberta."},
                        {"uso": "Emoções do momento", "exemplo_es": "Estoy feliz hoy.", "exemplo_pt": "Estou feliz hoje."}
                    ]
                }
            ]
        })
    },
    {
        "language": "russian",
        "title": "O Alfabeto Cirílico — Parte 1: Letras Familiares",
        "slug": "ru-alfabeto-parte-1",
        "lesson_type": "alphabet",
        "order_idx": 1,
        "content": json.dumps({
            "sections": [
                {
                    "type": "intro",
                    "text": "O alfabeto russo tem 33 letras. A boa notícia: 10 delas têm sons idênticos ou muito parecidos com o português! Comece por estas para ganhar confiança rápido."
                },
                {
                    "type": "alphabet_grid",
                    "title": "Letras com Sons Familiares",
                    "letters": [
                        {"cyrillic": "А а", "sound": "A", "example_ru": "аптека [apteka]", "example_pt": "como em 'casa'"},
                        {"cyrillic": "М м", "sound": "M", "example_ru": "мама [mama]", "example_pt": "como em 'mãe'"},
                        {"cyrillic": "Т т", "sound": "T", "example_ru": "там [tam]", "example_pt": "como em 'tudo' (nunca 'tchi')"},
                        {"cyrillic": "К к", "sound": "K", "example_ru": "кот [kot]", "example_pt": "como em 'casa'"},
                        {"cyrillic": "Л л", "sound": "L", "example_ru": "лампа [lampa]", "example_pt": "como em 'lua'"},
                        {"cyrillic": "Б б", "sound": "B", "example_ru": "банк [bank]", "example_pt": "como em 'bola'"},
                        {"cyrillic": "Д д", "sound": "D", "example_ru": "дом [dom]", "example_pt": "como em 'dado'"},
                        {"cyrillic": "З з", "sound": "Z", "example_ru": "зоопарк [zoopark]", "example_pt": "como em 'zero'"},
                        {"cyrillic": "Ф ф", "sound": "F", "example_ru": "фото [foto]", "example_pt": "como em 'faca'"},
                        {"cyrillic": "Ч ч", "sound": "TCH", "example_ru": "чай [tchai]", "example_pt": "como em 'tchau'! ✓"}
                    ]
                }
            ]
        })
    },
    {
        "language": "russian",
        "title": "O Alfabeto Cirílico — Parte 2: Letras Traiçoeiras",
        "slug": "ru-alfabeto-parte-2",
        "lesson_type": "alphabet",
        "order_idx": 2,
        "content": json.dumps({
            "sections": [
                {
                    "type": "intro",
                    "text": "Estas letras parecem familiares, mas NÃO SÃO! Memorize-as bem para não cometer erros de leitura."
                },
                {
                    "type": "warning",
                    "title": "Letras Traiçoeiras — Parecem X, mas são Y!",
                    "items": [
                        {"cyrillic": "В в", "looks_like": "Parece B", "actually_is": "É V! (como em 'você')", "example": "Вода [voda] = água"},
                        {"cyrillic": "Н н", "looks_like": "Parece H", "actually_is": "É N! (como em 'nada')", "example": "Нет [nyet] = não"},
                        {"cyrillic": "С с", "looks_like": "Parece C", "actually_is": "É S! (como em 'sol')", "example": "Спасибо [spasibo] = obrigado"},
                        {"cyrillic": "Р р", "looks_like": "Parece P", "actually_is": "É R vibrante!", "example": "Россия [Rossiya] = Rússia"},
                        {"cyrillic": "У у", "looks_like": "Parece Y de lado", "actually_is": "É U! (como em 'uva')", "example": "Улица [ulitsa] = rua"},
                        {"cyrillic": "Х х", "looks_like": "Parece X", "actually_is": "É KH (como R carioca forte)", "example": "Хорошо [khorosho] = bem/bom"}
                    ]
                }
            ]
        })
    },
    {
        "language": "russian",
        "title": "Os Casos Russos — Introdução Para Falantes de Português",
        "slug": "ru-casos-intro",
        "lesson_type": "grammar",
        "order_idx": 5,
        "content": json.dumps({
            "sections": [
                {
                    "type": "intro",
                    "text": "O russo tem 6 casos gramaticais. Isso significa que os substantivos, adjetivos e pronomes MUDAM DE FORMA dependendo do papel na frase. No português, usamos PREPOSIÇÕES para isso. Em russo, a preposição está embutida na própria palavra!"
                },
                {
                    "type": "tip",
                    "text": "Analogia: em português antigo (e ainda em pronomes), você diz EU (sujeito) mas MEU (posse) e ME (objeto). Em russo, TODOS os substantivos funcionam assim!"
                },
                {
                    "type": "grammar_table",
                    "title": "Os 6 Casos Russos",
                    "rows": [
                        {"caso": "Nominativo", "uso": "Sujeito da frase", "exemplo_ru": "студент [student]", "analogia_pt": "O estudante (sujeito)"},
                        {"caso": "Genitivo", "uso": "Posse / 'de'", "exemplo_ru": "студента [studenta]", "analogia_pt": "do estudante"},
                        {"caso": "Dativo", "uso": "Para quem / 'a/para'", "exemplo_ru": "студенту [studentu]", "analogia_pt": "ao/para o estudante"},
                        {"caso": "Acusativo", "uso": "Objeto direto", "exemplo_ru": "студента [studenta]", "analogia_pt": "o estudante (objeto)"},
                        {"caso": "Instrumental", "uso": "Com / meio / 'com'", "exemplo_ru": "студентом [studentom]", "analogia_pt": "com o estudante"},
                        {"caso": "Preposicional", "uso": "Lugar / sobre / 'em/sobre'", "exemplo_ru": "студенте [studente]", "analogia_pt": "no/sobre o estudante"}
                    ]
                },
                {
                    "type": "tip",
                    "text": "Não tente memorizar tudo de uma vez! Comece pelo Nominativo (sujeito) e Acusativo (objeto), que são os mais frequentes. Os outros virão naturalmente com a prática."
                }
            ]
        })
    }
]


@router.get("/")
def list_lessons(language: Optional[str] = None, db: Session = Depends(get_db)):
    # Seed built-in lessons if not present
    _ensure_builtin_lessons(db)
    query = db.query(Lesson)
    if language:
        query = query.filter(Lesson.language == language)
    lessons = query.order_by(Lesson.order_idx).all()
    return [
        {
            "id": l.id,
            "language": l.language,
            "title": l.title,
            "slug": l.slug,
            "lesson_type": l.lesson_type,
            "order_idx": l.order_idx,
        }
        for l in lessons
    ]


@router.get("/{slug}")
def get_lesson(slug: str, db: Session = Depends(get_db)):
    _ensure_builtin_lessons(db)
    lesson = db.query(Lesson).filter(Lesson.slug == slug).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {
        "id": lesson.id,
        "language": lesson.language,
        "title": lesson.title,
        "slug": lesson.slug,
        "lesson_type": lesson.lesson_type,
        "order_idx": lesson.order_idx,
        "content": json.loads(lesson.content),
    }


def _ensure_builtin_lessons(db: Session) -> None:
    for data in BUILTIN_LESSONS:
        exists = db.query(Lesson).filter(Lesson.slug == data["slug"]).first()
        if not exists:
            lesson = Lesson(**data)
            db.add(lesson)
    db.commit()
