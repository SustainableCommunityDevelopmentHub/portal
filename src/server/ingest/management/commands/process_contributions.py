from glob import glob

from  django.core.management.base import BaseCommand, CommandError
from django.conf import settings

from ingest import tasks

class Command(BaseCommand):
	help = 'Creates source data from supplied data, adds source data to database, transforms data and pushes to ES'

	def add_arguments(self, parser):
		parser.add_argument('data_path', choices=['test', 'production'])
		parser.add_argument('es', choices=['local', 'dev', 'production'])
		#parser.add_argument('metadata_type', choices=['marc', 'dc', 'mets'])
		#parser.add_argument('in_dir', help='name of new supplied_data dir')
		#parser.add_argument('-u', '--update', dest='update_es', action='store_true', help='reprocess data and push updated doc to ES')
		parser.add_argument('-n', '--new', dest='new', action='store_true', help='process only new contributions')

	def handle(self, *args, **options):
		if options['data_path'] == 'test':
			data_path = settings.TEST_DATA
		elif options['data_path'] == 'production':
			data_path = settings.PRODUCTION_DATA

		if options['es'] == 'local':
			es = settings.LOCAL
		elif options['es'] == 'dev': 
			es = settings.DEV
		elif options['es'] == 'production':
			es = settings.PROD

		if options['new'] is True:
			supplied_dirs = '{}/supplied_data/*'.format(data_path)
			for supplied_dir in glob(supplied_dirs):
				tasks.create_source(data_path, supplied_dir, es)
		else:
			inst_dirs = '{}/source_data/*'.format(data_path)
			for inst_dir in glob(inst_dirs):
				inst = inst_dir.split('/')[-1]
				print(inst)
				date_dirs = '{}/*'.format(inst_dir)
				for date_dir in glob(date_dirs):
					print(date_dir)
					tasks.process_data(inst, date_dir, es)


