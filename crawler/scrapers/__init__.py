"""
Scrapers package — exports all site-specific scraper classes.
"""
from scrapers.upsc  import UPSCScraper
from scrapers.ssc   import SSCScraper
from scrapers.ibps  import IBPSScraper
from scrapers.bpsc  import BPSCScraper
from scrapers.uppsc import UPPSCScraper
from scrapers.mppsc import MPPSCScraper

ALL_SCRAPERS = [
    UPSCScraper,
    SSCScraper,
    IBPSScraper,
    BPSCScraper,
    UPPSCScraper,
    MPPSCScraper,
]

__all__ = [
    "UPSCScraper",
    "SSCScraper",
    "IBPSScraper",
    "BPSCScraper",
    "UPPSCScraper",
    "MPPSCScraper",
    "ALL_SCRAPERS",
]
