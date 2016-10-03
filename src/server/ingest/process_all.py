import argparse
from glob import glob

from django.conf import settings
from ingest import tasks



def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('data_path', choices=['test', 'production'])
	parser.add_argument('es', choices=['local', 'dev', 'production'])
	parser.add_argument('-u', '--update', dest='update_es', action='store_true', help='reprocess data and push updated doc to ES')
	parser.add_argument('-c', '--create', dest='create_source', action='store_true', help='create source records from supplied data')

	args = parser.parse_args()

	if args.data_path == 'test':
		dp = settings.TEST_DATA
	elif args.data_path == 'production':
		dp = settins.PRODUCTION_DATA

	supplied_dirs_marc = '{}/supplied_data/marc_data/*'.format(dp)
	for supplied_dir_marc in glob(supplied_dirs_marc):
		metadata_type = 'marc'
		in_dir = supplied_dir_marc.split('/')[-1]

		contribution = tasks.Contribution(args.data_path, metadata_type, in_dir, args.es, args.update_es, args.create_source)
		contribution.contribute()

	supplied_dirs_dc = '{}/supplied_data/dc_data/*'.format(dp)
	for supplied_dir_dc in glob(supplied_dirs_dc):
		metadata_type = 'dc'
		in_dir = supplied_dir_dc.split('/')[-1]

		contribution = tasks.Contribution(args.data_path, metadata_type, in_dir, args.es, args.update_es, args.create_source)
		contribution.contribute()

	supplied_dirs_mets = '{}/supplied_data/mets_data/*'.format(dp)
	for supplied_dir_mets in glob(supplied_dirs_mets):
		metadata_type = 'mets'
		in_dir = supplied_dir_mets.split('/')[-1]

		contribution = tasks.Contribution(args.data_path, metadata_type, in_dir, args.es, args.update_es, args.create_source)
		contribution.contribute()


if __name__ == '__main__':
	main()