if [ ! -d node_modules ]; then
    sudo mkdir node_modules
fi
sudo chown node node_modules
echo 'alias c=clear' >> ~/.zshrc
sudo yarn install