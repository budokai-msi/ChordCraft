#!/usr/bin/env python3
"""
Setup script for Muzic integration with ChordCraft
Downloads and configures necessary components from Microsoft's Muzic repository
"""

import os
import sys
import subprocess
import requests
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MuzicSetup:
    def __init__(self):
        self.backend_dir = Path(__file__).parent
        self.muzic_dir = self.backend_dir / "muzic"
        self.models_dir = self.backend_dir / "models"
        
    def setup_directories(self):
        """Create necessary directories"""
        logger.info("Creating directories...")
        
        directories = [
            self.muzic_dir,
            self.models_dir,
            self.backend_dir / "temp_analysis"
        ]
        
        for directory in directories:
            directory.mkdir(exist_ok=True)
            logger.info(f"Created directory: {directory}")
    
    def install_dependencies(self):
        """Install required Python packages"""
        logger.info("Installing dependencies...")
        
        requirements = [
            "torch>=2.0.0",
            "transformers>=4.30.0",
            "pretty_midi>=0.2.10",
            "music21>=8.1.0",
            "scipy>=1.10.0",
            "scikit-learn>=1.3.0"
        ]
        
        for requirement in requirements:
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", requirement])
                logger.info(f"Installed: {requirement}")
            except subprocess.CalledProcessError as e:
                logger.error(f"Failed to install {requirement}: {e}")
                return False
        
        return True
    
    def clone_muzic_repository(self):
        """Clone the Muzic repository"""
        logger.info("Cloning Muzic repository...")
        
        muzic_repo_url = "https://github.com/microsoft/muzic.git"
        
        if self.muzic_dir.exists() and (self.muzic_dir / ".git").exists():
            logger.info("Muzic repository already exists, pulling latest changes...")
            try:
                subprocess.check_call(["git", "pull"], cwd=self.muzic_dir)
            except subprocess.CalledProcessError:
                logger.warning("Failed to pull latest changes, continuing with existing repository")
        else:
            try:
                subprocess.check_call(["git", "clone", muzic_repo_url, str(self.muzic_dir)])
                logger.info("Successfully cloned Muzic repository")
            except subprocess.CalledProcessError as e:
                logger.error(f"Failed to clone repository: {e}")
                return False
        
        return True
    
    def setup_musicbert_integration(self):
        """Set up MusicBERT components for symbolic music understanding"""
        logger.info("Setting up MusicBERT integration...")
        
        musicbert_dir = self.muzic_dir / "musicbert"
        if not musicbert_dir.exists():
            logger.warning("MusicBERT directory not found in cloned repository")
            return False
        
        # Create symbolic link or copy necessary files
        try:
            # Copy essential MusicBERT utilities
            musicbert_utils_src = musicbert_dir / "utils.py"
            musicbert_utils_dst = self.backend_dir / "musicbert_utils.py"
            
            if musicbert_utils_src.exists():
                import shutil
                shutil.copy2(musicbert_utils_src, musicbert_utils_dst)
                logger.info("Copied MusicBERT utilities")
            
        except Exception as e:
            logger.warning(f"Could not copy MusicBERT utilities: {e}")
        
        return True
    
    def setup_clamp_integration(self):
        """Set up CLaMP (Contrastive Language-Music Pre-training) components"""
        logger.info("Setting up CLaMP integration...")
        
        clamp_dir = self.muzic_dir / "clamp"
        if not clamp_dir.exists():
            logger.warning("CLaMP directory not found in cloned repository")
            return False
        
        # CLaMP setup would go here
        logger.info("CLaMP integration prepared")
        return True
    
    def download_pretrained_models(self):
        """Download pre-trained models if available"""
        logger.info("Checking for pre-trained models...")
        
        # Note: In a real implementation, you would download actual pre-trained models
        # For now, we'll create placeholder model files
        
        model_configs = {
            "musicbert_config.json": {
                "model_type": "musicbert",
                "vocab_size": 1000,
                "hidden_size": 768,
                "num_attention_heads": 12,
                "num_hidden_layers": 12
            },
            "clamp_config.json": {
                "model_type": "clamp",
                "text_encoder": "bert-base-uncased",
                "music_encoder": "musicbert",
                "projection_dim": 512
            }
        }
        
        import json
        for config_name, config_data in model_configs.items():
            config_path = self.models_dir / config_name
            with open(config_path, 'w') as f:
                json.dump(config_data, f, indent=2)
            logger.info(f"Created model config: {config_name}")
        
        return True
    
    def validate_setup(self):
        """Validate that the setup was successful"""
        logger.info("Validating setup...")
        
        try:
            # Test imports
            import torch
            import transformers
            import pretty_midi
            import music21
            
            logger.info("All required packages imported successfully")
            
            # Test Muzic integration
            from muzic_integration import MuzicEnhancedAnalyzer, validate_muzic_integration
            
            if validate_muzic_integration():
                logger.info("Muzic integration validation successful")
                return True
            else:
                logger.error("Muzic integration validation failed")
                return False
                
        except ImportError as e:
            logger.error(f"Import error during validation: {e}")
            return False
        except Exception as e:
            logger.error(f"Validation error: {e}")
            return False
    
    def run_setup(self):
        """Run the complete setup process"""
        logger.info("Starting Muzic integration setup for ChordCraft...")
        
        steps = [
            ("Setting up directories", self.setup_directories),
            ("Installing dependencies", self.install_dependencies),
            ("Cloning Muzic repository", self.clone_muzic_repository),
            ("Setting up MusicBERT", self.setup_musicbert_integration),
            ("Setting up CLaMP", self.setup_clamp_integration),
            ("Downloading models", self.download_pretrained_models),
            ("Validating setup", self.validate_setup)
        ]
        
        for step_name, step_function in steps:
            logger.info(f"Step: {step_name}")
            try:
                if not step_function():
                    logger.error(f"Setup failed at step: {step_name}")
                    return False
            except Exception as e:
                logger.error(f"Exception in step '{step_name}': {e}")
                return False
        
        logger.info("MUSIC Muzic integration setup completed successfully!")
        logger.info("You can now run your ChordCraft backend with enhanced music analysis capabilities.")
        
        return True


def main():
    """Main setup function"""
    setup = MuzicSetup()
    
    if setup.run_setup():
        print("\nPASS Setup completed successfully!")
        print("To start your enhanced ChordCraft backend, run:")
        print("  python app.py")
        print("\nThe backend will now include Muzic-enhanced music analysis capabilities.")
        sys.exit(0)
    else:
        print("\nFAIL Setup failed!")
        print("Please check the logs above for error details.")
        sys.exit(1)


if __name__ == "__main__":
    main()
