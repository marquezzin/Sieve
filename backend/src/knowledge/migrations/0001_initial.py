"""Initial migration — enables pgvector extension and creates Document/Chunk tables.

`RunSQL("CREATE EXTENSION ...")` é usado em vez de `pgvector.django.VectorExtension`
porque o último é incompatível com Django 6 (falta atributo `hints`). Comportamento
idêntico: registra o tipo `vector` no banco antes da criação do `VectorField`.
"""
import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
from pgvector.django import VectorField

try:
    _uuid_default = uuid.uuid7
except AttributeError:  # pragma: no cover
    _uuid_default = uuid.uuid4


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.RunSQL(
            sql="CREATE EXTENSION IF NOT EXISTS vector;",
            reverse_sql="DROP EXTENSION IF EXISTS vector;",
        ),
        migrations.CreateModel(
            name="KnowledgeDocument",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=_uuid_default,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("source_path", models.CharField(max_length=512, unique=True)),
                ("category", models.CharField(max_length=64)),
                ("agents", models.JSONField(default=list)),
                (
                    "priority",
                    models.CharField(
                        choices=[
                            ("always", "Always (full-load no system prompt)"),
                            ("retrieve", "Retrieve (top-k via pgvector)"),
                        ],
                        default="always",
                        max_length=16,
                    ),
                ),
                ("tags", models.JSONField(blank=True, default=list)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("content_md", models.TextField()),
                ("content_hash", models.CharField(max_length=64)),
            ],
            options={
                "ordering": ["category", "source_path"],
            },
        ),
        migrations.AddIndex(
            model_name="knowledgedocument",
            index=models.Index(fields=["category"], name="knowledge_k_categor_4be20a_idx"),
        ),
        migrations.AddIndex(
            model_name="knowledgedocument",
            index=models.Index(fields=["priority"], name="knowledge_k_priorit_a78bd0_idx"),
        ),
        migrations.CreateModel(
            name="KnowledgeChunk",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=_uuid_default,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("ordinal", models.PositiveIntegerField()),
                ("content", models.TextField()),
                ("embedding", VectorField(dimensions=settings.EMBEDDINGS_DIM)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                (
                    "document",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="chunks",
                        to="knowledge.knowledgedocument",
                    ),
                ),
            ],
            options={
                "ordering": ["document_id", "ordinal"],
            },
        ),
        migrations.AddConstraint(
            model_name="knowledgechunk",
            constraint=models.UniqueConstraint(
                fields=("document", "ordinal"),
                name="uniq_chunk_per_doc_ordinal",
            ),
        ),
    ]
