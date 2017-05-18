from  django.core.management.base import BaseCommand, CommandError

from ingest import tasks

class Command(BaseCommand):
	help = 'Creates new sitemaps from database'

	def handle(self, *args, **options):
		tasks.build_sitemaps()
