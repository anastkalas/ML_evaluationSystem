"""
    Service to store the hyperparameter schema for ML model evaluations.
"""
from typing import Dict, Optional
from copy import deepcopy
from datetime import datetime


# Internal in-memory storage
_ACTIVE_CONFIGURATION: Optional[Dict] = None
_LAST_UPDATED: Optional[datetime] = None


def set_hyperparameters(schema: Dict) -> None:

    global _ACTIVE_CONFIGURATION, _LAST_UPDATED

    # Defensive copy to avoid mutation from outside
    _ACTIVE_CONFIGURATION = deepcopy(schema)
    _LAST_UPDATED = datetime.utcnow()


def get_hyperparameters() -> Dict:

    if _ACTIVE_CONFIGURATION is None:
        raise RuntimeError("No hyperparameter configuration has been set")

    return deepcopy(_ACTIVE_CONFIGURATION)


def has_configuration() -> bool:
    
    return _ACTIVE_CONFIGURATION is not None


def clear_configuration() -> None:
    
    global _ACTIVE_CONFIGURATION, _LAST_UPDATED
    _ACTIVE_CONFIGURATION = None
    _LAST_UPDATED = None


def get_last_updated_timestamp() -> Optional[datetime]:
    
    return _LAST_UPDATED
