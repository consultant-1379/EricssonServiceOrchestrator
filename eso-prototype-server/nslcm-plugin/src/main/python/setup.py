from distutils.core import setup
from setuptools import find_packages

setup(
    name='nslcm_plugin',
    version='1.0',
    packages=find_packages(exclude=['contrib', 'docs', 'tests'])
)