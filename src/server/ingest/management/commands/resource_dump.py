from  django.core.management.base import BaseCommand, CommandError

from ingest import tasks

class Command(BaseCommand):
	help = 'Creates a Resource Sync resource dump'

	def handle(self, *args, **options):
		tasks.build_dump()
